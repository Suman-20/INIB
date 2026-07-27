import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const { data } = await api.post("/auth/register", form);

      login(data.user, data.token);
      navigate("/chat");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-bg-circle circle-one"></div>
      <div className="register-bg-circle circle-two"></div>

      <div className="register-container">
        {/* LEFT SIDE */}
        <div className="register-hero">
          <div className="register-logo">
            <div className="register-logo-icon">C</div>
            <span>ConnectChat</span>
          </div>

          <div className="register-hero-content">
            <span className="register-badge">
              REAL-TIME MESSAGING
            </span>

            <h1>
              Connect.
              <br />
              Chat.
              <br />
              Stay close.
            </h1>

            <p>
              Create your account and start real-time
              conversations with your friends.
            </p>

            <div className="register-features">
              <span>● Real-time chat</span>
              <span>● Online status</span>
              <span>● Secure messaging</span>
            </div>
          </div>

          <p className="register-hero-footer">
            Simple conversations. Instant connections.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="register-form-section">
          <div className="register-form-wrapper">
            <div className="register-mobile-logo">
              <div className="register-logo-icon">C</div>
              <span>ConnectChat</span>
            </div>

            <div className="register-heading">
              <span>GET STARTED</span>
              <h2>Create your account</h2>
              <p>
                Join ConnectChat and start a conversation.
              </p>
            </div>

            {error && (
              <div className="register-error">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}

            <form
              className="register-form"
              onSubmit={handleSubmit}
            >
              <div className="register-field">
                <label htmlFor="name">Full Name</label>

                <div className="register-input">
                  <span className="input-icon">👤</span>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="email">Email Address</label>

                <div className="register-input">
                  <span className="input-icon">✉</span>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="password">Password</label>

                <div className="register-input">
                  <span className="input-icon">🔒</span>

                  <input
                    id="password"
                    type={
                      showPassword ? "text" : "password"
                    }
                    name="password"
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <p className="password-hint">
                  Use at least 6 characters.
                </p>
              </div>

              <button
                className="register-submit"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="register-spinner"></span>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            <div className="register-divider">
              <span></span>
              <p>Already a member?</p>
              <span></span>
            </div>

            <p className="register-login">
              Already have an account?{" "}
              <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;