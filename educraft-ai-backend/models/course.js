const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  question: String,
  type: String,
  options: [String],
  answer: String,
});

const LessonSchema = new mongoose.Schema({
  title: String,
  explanation: String,
  quizzes: [QuizSchema],
  videos: [{
    title: String, videoId: String, url: String, thumbnail: String
  }]
});

const CourseSchema = new mongoose.Schema({
  course_name: String,
  goal: String,
  lessons: [LessonSchema],
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },   // <-- THIS LINE ADDED
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', CourseSchema);
