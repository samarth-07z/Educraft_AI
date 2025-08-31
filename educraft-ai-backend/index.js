require('dotenv').config();
const express = require("express");
const axios = require("axios");
const PDFDocument = require("pdfkit");
const cors = require("cors");

// --- MongoDB & Model ---
const mongoose = require('mongoose');
const Course = require('./models/course');

const app = express();
app.use(express.json());
app.use(cors());

// --- MongoDB connection ---
const mongoURL = process.env.MONGODB_URI || "mongodb://localhost:27017/educraftDB";
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB!"))
  .catch(err => console.error("MongoDB connect error:", err));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Helper to fetch a list of relevant YouTube videos for a lesson/topic
async function getYoutubeVideos(query) {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}&maxResults=2&type=video`;
    const res = await axios.get(url);
    return res.data.items.map(item => ({
      title: item.snippet.title,
      videoId: item.id.videoId,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail: item.snippet.thumbnails?.default?.url || ""
    }));
  } catch (e) {
    if (e.response) {
      console.error("YouTube API Error:", e.response.status, e.response.data);
    } else {
      console.error("YouTube API Error:", e);
    }
    return [];
  }
}

// Helper for robust JSON extraction from Gemini output
function safeJson(text) {
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1) {
    try {
      return JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    } catch (e) {}
  }
  return null;
}

// Helper to use Gemini to generate course structure with quizzes and explanations
async function generateCourseStructure(prompt, lessons) {
  const systemPrompt = `
You are a professional online course creator. Given a course topic and a number of lessons, return a VALID, strictly-structured JSON object in this form:
{
  "course_name": "...",
  "goal": "...one paragraph...",
  "lessons": [
    {
      "title": "...",
      "explanation": "...(multi-paragraph explanation for a beginner)...",
      "quizzes": [
        // EXACTLY five quizzes per lesson. Mix multiple choice, true/false, and short answer types.
        {
          "question": "...",
          "type": "multiple choice" | "true/false" | "short answer",
          "options": ["...","...","...","..."],    // INCLUDE THIS ARRAY ONLY for multiple choice (no A/B/C/D), just the option text!
          "answer": "..."                          // must match correct option text or answer
        }
        // repeat for five total quizzes
      ]
    }
    // repeat for each lesson
  ]
}
Important constraints:
- Each lesson must have exactly 5 quizzes.
- For multiple choice, INCLUDE "options": [...] as an array of 4 possible answers, never with "A."/"B." etc.
- Show "options" ONLY for multiple choice.
- "answer" must match exact option text or answer.
- Vary quiz types per lesson.
- Only output pure JSON.
`;
  const userPrompt = `Topic: ${prompt}\nNumber of lessons: ${lessons}`;

  try {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY;
    const requestBody = {
      contents: [{ parts: [{ text: systemPrompt + "\n" + userPrompt }] }]
    };
    const response = await axios.post(url, requestBody);
    const candidates = response.data.candidates;
    let text = "";
    if (
      candidates &&
      candidates[0] &&
      candidates[0].content &&
      candidates[0].content.parts &&
      candidates[0].content.parts[0].text
    ) {
      text = candidates[0].content.parts[0].text;
    } else if (response.data && response.data.text) {
      text = response.data.text;
    } else {
      throw new Error("Gemini response did not contain text.");
    }
    const json = safeJson(text);
    if (!json) throw new Error("Gemini output was not valid JSON:\n" + text);
    return json;
  } catch (err) {
    if (err.response) {
      console.error("Gemini API Error:", err.response.status, err.response.data);
    } else {
      console.error("Gemini Error:", err.message || err);
    }
    throw err;
  }
}

// Main API endpoint for course building & saving in MongoDB!
app.post('/api/generate-course', async (req, res) => {
  try {
    const { prompt, lessons } = req.body;
    if (!prompt || !lessons || isNaN(lessons) || lessons < 1 || lessons > 10)
      return res.status(400).json({ error: "Invalid input. Include prompt and lessons (1-10)." });

    const course = await generateCourseStructure(prompt, lessons);

    // Fetch videos for each lesson (concurrently for speed)
    course.lessons = await Promise.all(
      course.lessons.map(async lesson => {
        lesson.videos = await getYoutubeVideos(`${prompt} ${lesson.title}`);
        console.log(`Videos for lesson "${lesson.title}":`, lesson.videos.map(v => v.title));
        return lesson;
      })
    );

    // --- Save the course in MongoDB, debug the result ---
    console.log("[DB] About to save course:", course.course_name);
    const newCourse = new Course(course);
    await newCourse.save();
    console.log("[DB] Course saved successfully!");

    // Log returned course object for debug!
    console.log("Returning course:", JSON.stringify(course, null, 2));
    res.json({ course });

  } catch (err) {
    if (err.response) {
      console.error("API Error (route):", err.response.status, err.response.data);
    } else {
      console.error("Route Error:", err.stack || err);
    }
    const errorMsg =
      err.response && err.response.data && err.response.data.error && err.response.data.error.message
        ? err.response.data.error.message
        : (err.message || "Something went wrong.");
    res.status(500).json({ error: errorMsg });
  }
});

// PDF export endpoint
app.post('/api/export-pdf', async (req, res) => {
  try {
    const { course } = req.body;
    if (!course || !course.course_name || !course.lessons)
      return res.status(400).json({ error: "Missing or invalid course data." });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${course.course_name.replace(/[^a-z0-9]+/gi, '_')}.pdf"`
    );

    const doc = new PDFDocument();
    doc.pipe(res);

    doc.fontSize(24).text(course.course_name, { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text("Goal:", { underline: true });
    doc.fontSize(12).text(course.goal);
    doc.moveDown();

    course.lessons.forEach((lesson, i) => {
      doc.fontSize(16).text(`Lesson ${i + 1}: ${lesson.title}`);
      doc.fontSize(12).text(lesson.explanation || lesson.summary);
      doc.moveDown(0.5);

      // Quizzes
      if (lesson.quizzes && lesson.quizzes.length > 0) {
        doc.fontSize(13).text("Quiz:", { underline: true });
        lesson.quizzes.forEach((q, idx) => {
          doc.fontSize(11).text(`${idx + 1}. ${q.question}`);
          if (q.type === 'multiple choice' && Array.isArray(q.options) && q.options.length > 0) {
            q.options.forEach((opt, j) => {
              doc.fontSize(10).text(`   ${String.fromCharCode(65 + j)}. ${opt}`);
            });
            doc.fontSize(10).text(`   Correct Answer: ${q.answer}`);
          } else if (q.type === 'true/false') {
            doc.fontSize(10).text(`   Answer: ${q.answer}`);
          } else if (q.type === 'short answer') {
            doc.fontSize(10).text(`   Answer: ${q.answer}`);
          }
        });
      }
      // YouTube videos
if (lesson.videos && lesson.videos.length) {
  doc.moveDown(0.1);
  lesson.videos.forEach(v => {
    doc.fontSize(10)
      .fillColor('blue')
      .text("▶ " + v.title, { link: v.url, underline: true });
    doc.fillColor('black'); // <-- Add this to reset to normal text color
  });
}
doc.moveDown();

    });

    doc.end();
  } catch (err) {
    if (err.response) {
      console.error("PDF Route Error:", err.response.status, err.response.data);
    } else {
      console.error("PDF Route Error:", err.stack || err);
    }
    res.status(500).json({ error: "Failed to generate PDF." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`EduCraft AI backend running on port ${PORT}`));
