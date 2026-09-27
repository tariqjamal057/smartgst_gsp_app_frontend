// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style.css";
import { loginUser, sendOtp, registerUser, saveSession, getRole } from "../api/auth";

export default function Login() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);

  // Login states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // OTP states
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const routeByRole = (user) => {
    const role = getRole(user);
    if (role === "superadmin") navigate("/superadmin");
    else if (role === "admin") navigate("/admin");
    else navigate("/user");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      alert("Please enter email and password.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await loginUser({ email: loginEmail, password: loginPassword });
      saveSession({ access: data.access, refresh: data.refresh, user: data.user });
      routeByRole(data.user);
    } catch (err) {
      const msg = err.response?.data?.detail || "Invalid email or password.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setLoading(true);
    try {
      const { data } = await sendOtp(email, otp);
      if (data.success) {
        setOtpSent(true);
        setShowOtpSection(true);
        alert("OTP sent successfully! Check your email.");
      } else {
        alert("Failed to send OTP: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("OTP Send Error:", err);
      alert("Server error. Make sure backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill all fields.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (enteredOtp.length !== 6) {
      alert("Invalid OTP!");
      return;
    }
    setLoading(true);
    try {
      const fullName = name.trim().split(/\s+/);
      const payload = {
        email,
        first_name: fullName[0] || "",
        last_name: fullName.slice(1).join(" ") || "",
        password,
        password2: confirmPassword,
        otp: enteredOtp,
      };
      const { data } = await registerUser(payload);
      saveSession({ access: data.access, refresh: data.refresh, user: data.user });
      routeByRole(data.user);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const pwd = err.response?.data?.password;
      alert(detail || (Array.isArray(pwd) ? pwd.join(". ") : pwd) || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="smartgst-login-container">
      {/* Left Side - Image */}
      <div className="smartgst-image-half">
  <div className="image-wrapper">   {/* ← yeh naya div add kar */}
    <img src="/tax.jpg" alt="SmartGST" className="smartgst-bg-image" />
  </div>
<div className="smartgst-overlay">
  <p className="smartgst-desc">
   A secure, compliant, and enterprise-grade GST and accounting platform designed for businesses, accountants, and finance professionals.
  </p>
  <div className="smartgst-features" style={{color:"blue",marginright:"20px"}}>
  <p>Designed, developed, and maintained by AnuBrain Technology.</p>
  </div>
</div>


</div>


      {/* Right Side - Form */}
      <div className="smartgst-form-half">
        <div className="smartgst-login-card">
          <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>
          <p className="smartgst-subtitle">
            {isSignup ? "Register to access SmartGST" : "Login to your dashboard"}
          </p>

          {/* Login Form */}
          {!isSignup ? (
            <form onSubmit={handleLogin} className="smartgst-form">
              <input
                type="email"
                placeholder="Email Address"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              <button type="submit" className="smartgst-btn" disabled={loading}>
                {loading ? "LOGGING IN..." : "LOGIN"}
              </button>

              <div className="smartgst-links">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsSignup(true);
                  }}
                >
                  New user? Create account
                </a>
              </div>
            </form>
          ) : (
            /* Signup Form */
            <form onSubmit={handleVerifyOtp} className="smartgst-form">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={otpSent}
                required
              />

              <div className="smartgst-email-group">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={otpSent}
                  required
                />
                {!otpSent && email.includes("@") && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="smartgst-send-btn"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                )}
                {otpSent && (
                  <small className="smartgst-otp-sent">
                    ✓ OTP Sent to {email}
                  </small>
                )}
              </div>

              {showOtpSection && (
                <div className="smartgst-otp-section">
                  <p>Enter 6-digit OTP</p>
                  <input
                    type="text"
                    placeholder="••••••"
                    value={enteredOtp}
                    onChange={(e) =>
                      setEnteredOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    maxLength={6}
                    autoFocus
                  />
                </div>
              )}

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!otpSent}
                required
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={!otpSent}
                required
              />

              <button
                type="submit"
                className="smartgst-btn"
                disabled={!otpSent || enteredOtp.length !== 6 || loading}
              >
                {loading ? "REGISTERING..." : "Verify & Sign Up"}
              </button>

              <div className="smartgst-links">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsSignup(false);
                  }}
                >
                  Already have an account? Login
                </a>
              </div>
            </form>
          )}

          <p className="smartgst-copyright">
            © 2025 SmartGST - Powered by Sharma & Co
          </p>
        </div>
      </div>
    </div>
  );
}