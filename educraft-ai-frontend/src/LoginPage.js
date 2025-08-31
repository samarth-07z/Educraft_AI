import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import '@fontsource/poppins/900.css';
import '@fontsource/poppins/700.css';

// Typing animation for subtitle
const typing = keyframes`
  from { width: 0 }
  to { width: 100% }
`;
const blink = keyframes`
  0%, 100% { border-color: transparent }
  50% { border-color: #ad0be3; }
`;


const LandingWrapper = styled.div`
  position: fixed;
  top: 0; left: 0;
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  min-width: 100vw;
  background: linear-gradient(110deg,#e0c3fcb3 0%,#8ec5fcbb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow: hidden;
  z-index: 9999;
`;

const MainCard = styled.div`
  background: rgba(255,255,255,0.97);
  padding: 48px 36px 36px 36px;
  border-radius: 36px;
  box-shadow: 0 8px 38px 0 rgba(100,50,170,0.12), 0 1.5px 20px 0 rgba(110,40,170,0.08);
  min-width: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BigQuote = styled.h1`
  font-family: 'Poppins', 'Montserrat', 'Segoe UI', sans-serif;
  font-weight: 900;
  font-size: 2.7rem;
  color: #ad0be3ff;
  margin: 0;
  text-align: center;
  letter-spacing: 1.5px;
  text-shadow:
    0 2px 12px #fff,
    0 0 2px #fff,
    0 0 6px #fff;
  user-select: none;
  @media (max-width: 520px) { font-size: 2.1rem; }
`;

const TypingSubtitle = styled.div`
  font-family: 'Poppins', 'Montserrat', 'Segoe UI', sans-serif;
  font-weight: 700;
  font-size: 1.12rem;
  color: #234567;
  margin: 26px 0 0 0;
  min-height: 1.55em;
  letter-spacing: 0.8px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  border-right: 2.6px solid #ad0be3ff;
  width: ${props => props.width};
  animation:
    ${typing} 1.6s steps(36, end) 0.4s forwards,
    ${blink} 0.85s step-end infinite;
`;

const SubAuthor = styled.div`
  color: #7d2fc4;
  font-size: 1.08rem;
  font-weight: 600;
  margin: 7px 0 24px 0;
  opacity: 0.82;
  letter-spacing: 1.2px;
  text-align: center;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  margin-top: 44px;
  width: 100%;
  align-items: center;
`;

const Input = styled.input`
  width: 270px;
  padding: 14px 19px;
  border-radius: 16px;
  border: none;
  background: #f7f3fd;
  font-size: 1.04rem;
  margin-bottom: 18px;
  letter-spacing: 0.7px;
  transition: box-shadow 0.19s, border 0.13s;
  box-shadow: 0 2px 8px 0 rgba(180, 150, 210, 0.07);
  &:focus {
    outline: none;
    box-shadow: 0 2px 18px 0 rgba(140, 36, 220, 0.14);
    border: 1.5px solid #ad0be3ff;
  }
`;

const LoginButton = styled.button`
  background: linear-gradient(90deg, #ad0be3ff 65%, #8ec5fc 100%);
  color: #fff;
  border: none;
  border-radius: 15px;
  padding: 12px 44px;
  font-size: 1.15rem;
  font-weight: 900;
  letter-spacing: 0.9px;
  cursor: pointer;
  box-shadow: 0 2px 14px 0 rgba(140,0,220,0.12);
  transition: background 0.2s, transform 0.1s;
  margin-top: 10px;
  &:hover {
    background: linear-gradient(90deg, #8ec5fc, #ad0be3ff);
    color: #234567;
    transform: scale(1.04);
  }
`;

const WelcomeNote = styled.div`
  font-size: 1.08rem;
  color: #174ea6;
  margin-top: 30px;
  text-align: center;
  font-weight: 600;
  letter-spacing: 0.55px;
  opacity: ${p=>p.in?1:0};
  transition: opacity 0.4s 0.22s;
`;

// ------------- CORE COMPONENT ---------------
export default function LoginPage({ onLogin }) {
  const [step, setStep] = useState(0);
  const [subtitleWidth, setSubtitleWidth] = useState("0ch");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    setTimeout(() => setSubtitleWidth("32ch"), 350);
  }, []);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    if(!form.name || !form.email || !form.password) return alert("Please fill in all fields!");
    setStep(1);
    setTimeout(() => {
      // --- Add random avatar selection here ---
      const AVATAR_CHOICES = [
  "/avatar1.jpg", "/avatar2.jpg", "/avatar3.jpg", "/avatar4.jpg",
  "/avatar5.jpeg", "/avatar6.jpeg", "/avatar7.jpeg", "/avatar8.jpeg"
];
const avatarUrl = AVATAR_CHOICES[Math.floor(Math.random() * AVATAR_CHOICES.length)];
onLogin({ ...form, avatar: avatarUrl });
    }, 1000);
  };

  return (
    <LandingWrapper>
      <MainCard>
        <BigQuote>
          Welcome to EduCraft
        </BigQuote>
        <SubAuthor>by Samarth S</SubAuthor>

        <TypingSubtitle width={subtitleWidth}>
          Ready to start your learning journey?
        </TypingSubtitle>

        {step === 0 && (
          <LoginForm autoComplete="off" onSubmit={handleSubmit}>
            <Input name="name" placeholder="Full Name" autoFocus value={form.name} onChange={handleChange} />
            <Input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
            <Input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
            <LoginButton type="submit">Enter EduCraft</LoginButton>
          </LoginForm>
        )}

        <WelcomeNote in={step===1}>
          Welcome, {form.name.trim() || "User"}!<br />
          🚀 Let's get learning.
        </WelcomeNote>
      </MainCard>
    </LandingWrapper>
  );
}
