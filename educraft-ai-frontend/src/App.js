import React, { useState, useRef, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';
import LoginPage from './LoginPage';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

const AVATAR_CHOICES = [
  "/avatar1.jpg", "/avatar2.jpg", "/avatar3.jpg", "/avatar4.jpg",
  "/avatar5.jpeg", "/avatar6.jpeg", "/avatar7.jpeg", "/avatar8.jpeg"
];
const APP_VERSION = "0.0.7";

// ========== STYLED COMPONENTS ==========
const GlobalStyle = createGlobalStyle`
  body {
    background: url('/bg.png') center center / cover no-repeat fixed;
    min-height: 100vh;
    margin: 0;
    font-family: 'Montserrat', 'Segoe UI', sans-serif;
    transition: background 0.3s;
  }
`;

const CenteredWrapper = styled.div`
  position: fixed;
  top: 49.2%;
  left: 50%;
  width: 100vw;
  min-height: 100vh;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  font-size: 3.2rem;
  font-weight: 900;
  color: #ad0be3ff;
  letter-spacing: 2px;
  margin: 0 0 18px 0;
  text-align: center;
  position: relative;
  z-index: 100;
  text-shadow:
    0 2px 12px #fff,
    0 0 2px #fff,
    0 0 6px #fff;
`;

const ChatContainer = styled.div`
  background: #fff;
  box-shadow: 0 10px 38px 0 rgba(40, 60, 120, 0.21);
  border-radius: 32px;
  max-width: 500px;
  width: 94vw;
  min-height: 350px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: stretch;
  padding: 38px 30px 26px 30px;
  margin: 0 auto; /* Centers on larger screens */
  position: relative;

  /* ----- MOBILE OPTIMIZATION ----- */
  @media (max-width: 600px) {
    width: 92vw;
    margin-left: 4vw;
    margin-right: 4vw;
    padding-left: 5vw;
    padding-right: 5vw;
    box-sizing: border-box;
  }
`;


const ChatbotIntro = styled.div`
  background: linear-gradient(90deg, #e0c3fc, #8ec5fc 90%);
  color: #234567;
  font-size: 0.93rem;
  font-weight: 500;
  margin-bottom: 14px;
  border-radius: 22px 22px 18px 18px;
  padding: 20px 18px;
  box-shadow: 0 4px 12px 0 rgba(80, 100, 180, 0.09);
  text-align: center;
  line-height: 1.3;
`;

const ChatMessages = styled.div`
  width: 100%;
  max-height: 340px;
  overflow-y: auto;
  margin-bottom: 16px;
  min-height: 80px;
`;

const InputRow = styled.form`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 8px;
  flex-wrap: wrap; /* Allow wrapping on small screens */

  @media (max-width: 600px) {
    flex-direction: column;    /* stack items vertically on mobile */
    gap: 8px;                  /* reduce gap */
    align-items: stretch;      /* stretch inputs/buttons full width */
  }
`;


const ChatInput = styled.input`
  flex: 2;
  border: none;
  background: #f2f6fa;
  border-radius: 18px;
  font-size: 1.13rem;
  padding: 14px 16px;
  box-shadow: 0 2px 8px 0 rgba(200, 200, 220, 0.12);
  transition: box-shadow 0.2s;
  &:focus {
    outline: none;
    box-shadow: 0 2px 12px 0 rgba(58, 125, 180, 0.15);
  }
`;

const LessonsInput = styled.input`
  width: 58px;
  border: 1px solid #dee2e6;
  background: #f7fafc;
  border-radius: 15px;
  font-size: 1.02rem;
  padding: 10px 8px 10px 14px;
  margin-left: 6px;
  box-shadow: 0 2px 6px 0 rgba(200, 200, 220, 0.07);
  &:focus {
    outline: none;
    box-shadow: 0 2px 12px 0 rgba(58, 125, 180, 0.12);
    border: 1px solid #b2bec3;
  }
`;

const SendButton = styled.button`
  background: linear-gradient(90deg, #8ec5fc, #e0c3fc);
  color: #234567;
  border: none;
  border-radius: 16px;
  padding: 12px 28px;
  font-size: 1.07rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px 0 rgba(110,160,210,0.14);
  transition: background 0.2s, transform 0.1s;
  &:hover {
    background: linear-gradient(90deg, #e0c3fc, #8ec5fc);
    transform: scale(1.03);
  }
`;

const ExportButton = styled.button`
  background: linear-gradient(90deg, #f7971e 20%, #ffd200 100%);
  color: #234567;
  border: none;
  border-radius: 16px;
  padding: 8px 20px;
  font-size: 1.07rem;
  font-weight: 700;
  margin-top: 20px;
  cursor: pointer;
  box-shadow: 0 2px 8px 0 rgba(160,160,110,0.11);
  transition: background 0.2s, transform 0.1s;
  &:hover {
    background: linear-gradient(90deg, #ffd200, #f7971e);
    transform: scale(1.04);
  }
`;

const ProgressContainer = styled.div`
  position: fixed;
  top: 90px;
  right: 2vw;
  background: rgba(255,255,255,0.97);
  border-radius: 18px 0 0 18px;
  box-shadow: 0 2px 14px 0 rgba(60,100,150,0.13);
  padding: 24px 32px 18px 32px;
  min-width: 240px;
  max-width: 320px;
  max-height: calc(30vh);
  overflow-y: auto;
  z-index: 100;
  &::-webkit-scrollbar {
    width: 9px;
    border-radius: 18px;
    background: #eee;
  }
  &::-webkit-scrollbar-thumb {
    background: #ad0be3ff;
    border-radius: 18px;
    border: 2px solid #eee;
    margin-top: 3px;
    margin-bottom: 3px;

    @media (max-width: 600px) {
    position: static;
    width: 92vw;
    margin: 24px auto 0 auto;
    border-radius: 24px;
    padding: 18px 5vw 16px 5vw;
    box-shadow: 0 3px 12px 0 rgba(60,100,150,0.08);
    max-width: 500px;
    /* remove right/top, z-index */
  }
`;

const StatsContainer = styled.div`
  position: fixed;
  right: 2vw;
  bottom: 36px;
  background: linear-gradient(90deg,#e0c3fc 60%,#8ec5fc 100%);
  border-radius: 24px;
  box-shadow: 0 2px 10px 0 rgba(80,100,180,0.12);
  padding: 24px 18px;
  max-width: 320px;
  width: 100%;
  color: #234567;
  z-index: 101;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 600px) {
    position: static;
    width: 92vw;
    margin: 24px auto 0 auto;
    border-radius: 24px;
    padding: 18px 5vw 16px 5vw;
    box-shadow: 0 3px 12px 0 rgba(60,100,150,0.08);
    max-width: 500px;
    /* remove right/bottom, z-index */
`;

const QuizzesPanel = styled.div`
  position: fixed;
  top: 90px;
  left: 2vw;
  background: rgba(255,255,255,0.97);
  border-radius: 18px 0 0 18px;
  box-shadow: 0 2px 14px 0 rgba(60,100,150,0.13);
  padding: 18px 24px 16px 24px;
  min-width: 245px;
  z-index: 100;
  max-width: 340px;
  border: 2px solid #e0e5ee;
  font-size: 1.03em;
  min-height: 140px;
  max-height: calc(90.2vh - 90px);
  overflow-y: auto;
  overscroll-behavior: contain;
  display: flex;
  flex-direction: column;
  scrollbar-width: thin;
  scrollbar-color: #ad0be3ff #eee;
  &::-webkit-scrollbar {
    width: 9px;
    border-radius: 18px;
    background: #eee;
  }
  &::-webkit-scrollbar-thumb {
    background: #ad0be3ff;
    border-radius: 18px;
    border: 2px solid #eee;

    @media (max-width: 600px) {
    position: static;
    width: 92vw;
    margin: 24px auto 0 auto;
    border-radius: 24px;
    padding: 18px 5vw 16px 5vw;
    box-shadow: 0 3px 12px 0 rgba(60,100,150,0.08);
    max-width: 500px;
    /* remove left/top, z-index */
  }
`;

// ========== APP MAIN ==========
function App() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showEditAvatar, setShowEditAvatar] = useState(false);
  const avatarRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        avatarRef.current &&
        !avatarRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
        setShowEditAvatar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setUser(null);
    setDropdownOpen(false);
    setShowEditAvatar(false);
  };

  // Remaining app hooks and logic below (unchanged)

  const [prompt, setPrompt] = useState('');
  const [lessons, setLessons] = useState(3);
  const [messages, setMessages] = useState([
    {
      sender: 'system',
      text: "👋 Hi, I'm EduCraft AI! Tell me what programming (or school) topic you'd like to learn or teach. Ready to create your own custom course?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [lastCourse, setLastCourse] = useState(null);
  const [lessonProgress, setLessonProgress] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResults, setQuizResults] = useState({});
  const messagesEndRef = useRef(null);

  const totalLessons = lastCourse?.lessons?.length || 0;
  const doneLessons = Object.values(lessonProgress || {}).filter(Boolean).length;
  let totalQuizzes = 0, correctQuizzes = 0;
  if (lastCourse && lastCourse.lessons) {
    lastCourse.lessons.forEach((lesson, lidx) => {
      const quizzes = (lesson.quizzes || []).slice(0,5);
      totalQuizzes += quizzes.length;
      quizzes.forEach((q, qidx) => {
        if (quizResults?.[lidx]?.[qidx]) correctQuizzes++;
      });
    });
  }
  const percentLessons = totalLessons ? Math.round((doneLessons/totalLessons)*100) : 0;
  const percentQuizzes = totalQuizzes ? Math.round((correctQuizzes/totalQuizzes)*100) : 0;
  const chartData = {
    labels: ['Lesson Progress', 'Quiz Accuracy'],
    datasets: [{
      label: '%',
      data: [percentLessons, percentQuizzes],
      backgroundColor: [
        'rgba(142,44,255,0.71)',
        'rgba(36,125,220,0.65)',
      ],
      borderRadius: 11,
      borderWidth: 0,
      barPercentage: 0.65,
    }],
  };
  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        min: 0, max: 100,
        ticks: { stepSize: 20, color: "#234567", font: { size: 11, weight: 600 } },
        grid: { color: "#eef1fa" }
      },
      x: {
        ticks: { color: "#275569", font: { size: 12, weight: 700 } },
        grid: { display: false }
      }
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (lastCourse && lastCourse.lessons) {
      const key = lastCourse.course_name || "default";
      const saved = JSON.parse(localStorage.getItem('educraft_progress_' + key) || '{}');
      if (!saved || Object.keys(saved).length !== lastCourse.lessons.length) {
        setLessonProgress(Array(lastCourse.lessons.length).fill(false));
      } else {
        setLessonProgress(saved);
      }
      setQuizAnswers({});
      setQuizResults({});
    }
  }, [lastCourse]);

  const handleLessonToggle = (idx) => {
    if (!lastCourse || !lastCourse.course_name) return;
    const key = lastCourse.course_name;
    setLessonProgress(prev => {
      const next = { ...prev, [idx]: !prev[idx] };
      localStorage.setItem('educraft_progress_' + key, JSON.stringify(next));
      return next;
    });
  };
  const handleQuizSelect = (lessonIdx, quizIdx, value) => {
    setQuizAnswers(prev => ({
      ...prev,
      [lessonIdx]: {
        ...(prev[lessonIdx] || {}),
        [quizIdx]: value
      }
    }));
  };
  const handleSubmitQuizzes = () => {
  if (!lastCourse) return;
  const results = {};
  lastCourse.lessons.forEach((lesson, lidx) => {
    results[lidx] = {};
    (lesson.quizzes || []).slice(0,5).forEach((quiz, qidx) => {
      const userAnswer = quizAnswers?.[lidx]?.[qidx];
      let correct = false;
      if (quiz.type === 'multiple choice') {
        // Only mark correct if EXACT match, case-insensitive
        const correctText = typeof quiz.answer === "string" ? quiz.answer.trim().toLowerCase() : "";
        const choiceText = userAnswer ? userAnswer.trim().toLowerCase() : "";
        correct = choiceText === correctText;
      } else if (quiz.type === 'true/false' || quiz.type === 'short answer') {
        correct = userAnswer && userAnswer.trim().toLowerCase() === quiz.answer.trim().toLowerCase();
      }
      results[lidx][qidx] = correct;
    });
  });
  setQuizResults(results);
};

  const handleSend = async (e) => {
    e.preventDefault();
    if (prompt.trim() === '') return;
    setMessages(prev => [...prev, { sender: 'user', text: prompt }]);
    setLoading(true);
    setMessages(prev => [...prev, { sender: 'ai', text: '⏳ Generating your course...' }]);
    setPrompt('');
    try {
      const response = await axios.post('http://localhost:5000/api/generate-course', {
        prompt,
        lessons,
      });
      setMessages(prev => prev.slice(0, -1));
      const course = response.data.course;
      setLastCourse(course);
      if (!course) {
        setMessages(prev => [
          ...prev,
          { sender: 'ai', text: '❌ Sorry, could not generate course. Please try again.' }
        ]);
        setLoading(false);
        return;
      }
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: (
            <div style={{ textAlign: 'left', fontWeight: 400, color: '#17385d' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.2em', margin: '6px 0' }}>{course.course_name}</div>
              <div style={{ margin: "10px 0 5px 0", fontStyle: 'italic' }}>
                <b>Goal:</b> {course.goal}
              </div>
              <ol style={{ paddingLeft: '19px', color: '#234567' }}>
                {course.lessons.map((lesson, i) => (
                  <li key={i} style={{ marginBottom: '12px' }}>
                    <b>{lesson.title}</b>
                    <div style={{ margin: "6px 0 5px 0", fontSize: "1em" }}>
                      {lesson.explanation || lesson.summary || "(No detailed explanation returned.)"}
                    </div>
                    {lesson.videos && lesson.videos.length > 0 ? (
                      <div>
                        <div style={{ fontSize: '0.98em', color: '#174ea6', margin: '5px 0 2px 0' }}>Videos:</div>
                        <ul style={{ paddingLeft: '16px' }}>
                          {lesson.videos.map((v, j) => (
                            <li key={j} style={{ marginBottom: 4 }}>
                              <a href={v.url} target="_blank" rel="noopener noreferrer" style={{ color: '#237ddb', textDecoration: 'underline' }}>
                                {v.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.97em', color: '#8c95a4', marginTop: 4 }}>No relevant videos found for this lesson.</div>
                    )}
                  </li>
                ))}
              </ol>
              <ExportButton onClick={() => handleExportPDF(course)}>Export as PDF</ExportButton>
            </div>
          )
        }
      ]);
    } catch (err) {
      setMessages(prev => prev.slice(0, -1));
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: '❌ Error: Could not connect to EduCraft backend. Check your servers and try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };
  const handleExportPDF = async (courseToExport) => {
    try {
      const res = await axios.post(
        'http://localhost:5000/api/export-pdf',
        { course: courseToExport },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${courseToExport.course_name.replace(/[^a-z0-9]+/gi, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (e) {
      alert('PDF export failed. Try again.');
    }
  };

  if (!user) return <LoginPage onLogin={setUser} />;

  return (
    <>
      <GlobalStyle />
      {/* ========== AVATAR DROPDOWN MENU ========== */}
      <div ref={avatarRef} style={{ position: "fixed", top: 13, right: 24, zIndex: 999 }}>
        <div
          onClick={() => setDropdownOpen(x => !x)}
          style={{
            display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.96)',
            borderRadius: "22px", padding: "5px 14px 5px 7px", cursor: "pointer",
            boxShadow: dropdownOpen
              ? "0 6px 24px 0 rgba(172, 86, 235, 0.18)"
              : "0 2px 17px 0 rgba(140, 11, 227, 0.13)",
            transition: "box-shadow 0.22s"
          }}
          tabIndex={0}
          aria-label="Open user menu"
          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setDropdownOpen(x => !x); }}
        >
          <img
            src={user.avatar}
            alt="avatar"
            style={{
              width: 34, height: 34, borderRadius: "50%",
              marginRight: 7, border: "2px solid #ad0be3ff", background: "white",
              boxShadow: dropdownOpen ? "0 0 0 3px #e4d4f7" : "none",
              transition: "box-shadow 0.18s"
            }}
          />
          <span style={{ fontWeight: 700, fontSize: "0.99em", color: "#7b2fc4" }}>{user.name}</span>
          <svg width="18" height="18" style={{marginLeft:7,fill:"#ad0be3"}} viewBox="0 0 20 20" aria-hidden="true">
            <path d="M5.5 8l4.5 4 4.5-4" stroke="#ad0be3" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
        </div>
        {dropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: 60, right: 0, minWidth: 212,
              background: "#fff",
              borderRadius: 22,
              boxShadow: "0 14px 44px 0 rgba(110,40,220,0.13)",
              padding: "18px 22px 14px 22px",
              display: "flex", flexDirection: "column", alignItems: "center"
            }}
          >
            <img
              src={user.avatar}
              alt="User avatar"
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                border: "2.4px solid #ad0be3ff",
                marginBottom: 10,
                boxShadow: "0 2px 9px 0 rgba(170,44,230,0.07)",
                objectFit: "cover"
              }}
            />
            <div
              style={{
                fontWeight: 700,
                color: "#7b2fc4",
                fontSize: "1.07em",
                marginBottom: 2,
                marginTop: -3
              }}>
              {user.name}
            </div>
            {user.email && (
              <div style={{
                fontSize: "0.96em", color: "#888", marginBottom: 11,
                fontWeight: 400, opacity: 0.94, wordBreak: "break-all", textAlign: "center"
              }}>
                {user.email}
              </div>
            )}
            <button
              onClick={() => { setShowEditAvatar(true); setDropdownOpen(false); }}
              style={{
                marginTop: 0, marginBottom: 8, padding: "8px 20px",
                borderRadius: 12, border: "none",
                background: "linear-gradient(90deg,#e0c3fc 60%,#8ec5fc 100%)",
                color: "#234567", fontWeight: 600, fontSize: "1.01em",
                cursor: "pointer", transition: "background 0.21s, color 0.17s"
              }}
            >
              Edit avatar
            </button>
            <div style={{ fontSize: "0.93em", color: "#aaa", marginTop: 7, marginBottom: 7 }}>
              App version: {APP_VERSION}
            </div>
            <button
              style={{
                background: "none", border: "none", color: "#c23", fontWeight: 500,
                fontSize: "0.98em", cursor: "pointer", borderRadius: 9, padding: "7px 0"
              }}
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        )}

        {/* Edit avatar modal */}
        {showEditAvatar && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(20,20,40,0.13)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100
          }}>
            <div style={{
              background: "#fff", borderRadius: 24, padding: 32, minWidth: 320, boxShadow: "0 6px 34px 0 rgba(80,50,160,0.14)", textAlign: "center"
            }}>
              <div style={{ fontWeight: 700, fontSize: "1.09em", marginBottom: 18, color:"#6a1dbf" }}>Choose your avatar</div>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 14 }}>
                {AVATAR_CHOICES.map(img => (
                  <img
                    key={img}
                    src={img}
                    alt={img}
                    tabIndex={0}
                    style={{
                      width: 50, height: 50, borderRadius: "50%",
                      border: img === user.avatar ? "3px solid #8ec5fc" : "2px solid #e7e7f3",
                      boxShadow: img === user.avatar ? "0 0 0 4px #e4dcfb99" : "none",
                      cursor: "pointer", transition: "border 0.19s, box-shadow 0.16s"
                    }}
                    onClick={() => { setUser(u => ({ ...u, avatar: img })); setShowEditAvatar(false); }}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ") {
                        setUser(u => ({ ...u, avatar: img }));
                        setShowEditAvatar(false);
                      }
                    }}
                  />
                ))}
              </div>
              <button
                onClick={() => setShowEditAvatar(false)}
                style={{
                  background: "#ece9f6", color: "#234567", border: "none",
                  borderRadius: 8, padding: "7px 24px", fontWeight: 600, fontSize: "1.01em", cursor: "pointer", marginTop: 4
                }}
              >Cancel</button>
            </div>
          </div>
        )}
      </div>
      {/* === END AVATAR DROPDOWN === */}

      {/* Left-side quizzes panel */}
      {lastCourse && lastCourse.lessons && (
        <QuizzesPanel>
  <h3 style={{marginTop:0, color:"#7d2fc4"}}>Lesson Quizzes</h3>
  {lastCourse.lessons.map((lesson, lidx) => (
    <div key={lidx} style={{marginBottom:14}}>
      <b style={{fontSize:"0.98em",color:"#275569"}}>{lesson.title}</b>
      <ul style={{listStyle:'none', padding:0, margin:0, fontSize:"0.99em"}}>
      {/* Only MCQ and True/False quizzes, never "short answer" */}
      {(lesson.quizzes || [])
        .slice(0,5)
        .filter(quiz => quiz.type === "multiple choice" || quiz.type === "true/false")
        .map((quiz, qidx) => (
        <li key={qidx} style={{marginBottom:8, paddingBottom:2, borderBottom:"1px solid #f1f2f7"}}>
          <div>{quiz.question}</div>
          {quiz.type === "multiple choice" && quiz.options && (
            <ul style={{margin:"6px 0 2px 16px",padding:0}}>
              {quiz.options.map((opt, j) => {
                const optText = opt.replace(/^[A-Da-d]\.\s*/, "");
                return (
                  <li key={j}>
                    <label>
                      <input
                        type="radio"
                        name={`quiz-${lidx}-${qidx}`}
                        value={opt}
                        checked={quizAnswers[lidx]?.[qidx] === opt}
                        onChange={() => handleQuizSelect(lidx, qidx, opt)}
                        style={{marginRight:4}}
                      />
                      {String.fromCharCode(65 + j)}. {optText}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
          {quiz.type === "true/false" && (
            <div>
              <label>
                <input
                  type="radio"
                  name={`quiz-${lidx}-${qidx}`}
                  value="True"
                  checked={quizAnswers[lidx]?.[qidx] === "True"}
                  onChange={() => handleQuizSelect(lidx, qidx, "True")}
                  style={{marginRight:4}} />
                True
              </label>
              <label style={{marginLeft:12}}>
                <input
                  type="radio"
                  name={`quiz-${lidx}-${qidx}`}
                  value="False"
                  checked={quizAnswers[lidx]?.[qidx] === "False"}
                  onChange={() => handleQuizSelect(lidx, qidx, "False")}
                  style={{marginRight:4}} />
                False
              </label>
            </div>
          )}
          {/* Show result icon */}
          {quizResults[lidx] && quizResults[lidx][qidx] !== undefined && (
            <span style={{marginLeft:8}}>
              {quizResults[lidx][qidx]
                ? <span style={{color:"green"}}>✔</span>
                : <span style={{color:"red"}}>✖</span>
              }
            </span>
          )}
        </li>
      ))}
      </ul>
    </div>
  ))}
  <button
    style={{
      marginTop:8, padding:"8px 26px",
      fontWeight:700, color:"#234567",
      background:"linear-gradient(90deg,#e0c3fc,#8ec5fc)",
      border:"none", borderRadius:10, cursor:"pointer", fontSize:"1em"
    }}
    onClick={handleSubmitQuizzes}
  >
    Submit All Quizzes
  </button>
</QuizzesPanel>
      )}
      {/* Right-side Progress container */}
      {lastCourse && lastCourse.lessons && (
        <>
          <ProgressContainer>
            <h3 style={{marginTop:0, color:"#7d2fc4"}}>Your Progress</h3>
            <ul style={{listStyle:'none', padding:0}}>
              {lastCourse.lessons.map((lesson, idx) =>
                <li key={idx} style={{display:'flex',alignItems:'center',marginBottom:6}}>
                  <input
                    type="checkbox"
                    checked={!!lessonProgress[idx]}
                    onChange={() => handleLessonToggle(idx)}
                    style={{marginRight:10, accentColor:'#8ec5fc', width:18, height:18}}
                  />
                  <span style={{
                    textDecoration: lessonProgress[idx] ? 'line-through':'none',
                    color: lessonProgress[idx] ? '#7bc07c':'#234567',
                    fontWeight: lessonProgress[idx] ? 600 : 400
                  }}>
                    {lesson.title}
                  </span>
                </li>
              )}
            </ul>
            <div style={{marginTop:10,fontWeight:500, fontSize:'1.08em'}}>
              Progress: {Object.values(lessonProgress).filter(Boolean).length} / {lastCourse.lessons.length}
            </div>
          </ProgressContainer>
          <StatsContainer>
            <h4 style={{margin:"0 0 15px 0",fontWeight:800,fontSize:"1.1em",color:"#234567"}}>Your Performance</h4>
            <Bar data={chartData} options={chartOptions} style={{maxHeight:160, maxWidth:260}} />
            <div style={{marginTop:20,fontSize:"1.06em",textAlign:"center"}}>
              <b>Lessons completed:</b> {doneLessons} / {totalLessons}<br />
              <b>Correct answers:</b> {correctQuizzes} / {totalQuizzes}
            </div>
          </StatsContainer>
        </>
      )}
      {/* Centered main area */}
      <CenteredWrapper>
        <Title>EduCraft AI</Title>
        <ChatContainer>
          <ChatbotIntro>
            <span>
              📚 <b>Welcome!</b><br />
              I’m your AI learning assistant.<br />
              <em>Type a subject (like “C++ basics” or “OOP in Python”)</em><br />
              and I’ll build a mini course, find great videos, and generate quizzes for your journey!
            </span>
          </ChatbotIntro>
          <ChatMessages>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: 14,
                  textAlign: msg.sender === 'user' ? 'right' : 'left',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    padding: '11px 17px',
                    borderRadius:
                      msg.sender === 'user'
                        ? '23px 23px 7px 22px'
                        : '23px 23px 22px 7px',
                    background:
                      msg.sender === 'user'
                        ? 'linear-gradient(90deg,#e0c3fc 30%,#8ec5fc 100%)'
                        : '#f1f7fa',
                    color: '#234567',
                    fontWeight: 500,
                    maxWidth: '75%',
                    boxShadow: '0 2px 7px 0 rgba(200,200,220,0.06)',
                  }}
                >
                  {typeof msg.text === "string" ? msg.text : msg.text}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </ChatMessages>
          <InputRow onSubmit={handleSend}>
            <ChatInput
              type="text"
              placeholder='Type a subject: e.g. "Teach Python basics"'
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              disabled={loading}
            />
            <LessonsInput
              type="number"
              min={1}
              max={10}
              value={lessons}
              onChange={e => setLessons(Number(e.target.value))}
              disabled={loading}
              title='Number of lessons'
            />
            <SendButton type="submit" disabled={loading}>Send</SendButton>
          </InputRow>
        </ChatContainer>
      </CenteredWrapper>
    </>
  );
}

export default App;
