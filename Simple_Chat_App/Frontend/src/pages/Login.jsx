import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
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

      const { data } = await api.post("/auth/login", form);

      login(data.user, data.token);
      navigate("/chat");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-glow login-glow-one"></div>
      <div className="login-glow login-glow-two"></div>

      <div className="login-container">
        {/* LEFT SIDE */}
        <section className="login-form-section">
          <div className="login-form-wrapper">
            <div className="login-brand">
              <div className="login-brand-icon">C</div>

              <div>
                <h2>ConnectChat</h2>
                <span>REAL-TIME MESSAGING</span>
              </div>
            </div>

            <div className="login-heading">
              <span>WELCOME BACK</span>

              <h1>Sign in to your account</h1>

              <p>
                Continue your conversations and connect
                with your friends.
              </p>
            </div>

            {error && (
              <div className="login-error">
                <div>!</div>
                <p>{error}</p>
              </div>
            )}

            <form
              className="login-form"
              onSubmit={handleSubmit}
            >
              <div className="login-field">
                <label htmlFor="login-email">
                  Email Address
                </label>

                <div className="login-input">
                  <div className="login-input-icon">
                    @
                  </div>

                  <input
                    id="login-email"
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

              <div className="login-field">
                <div className="login-password-label">
                  <label htmlFor="login-password">
                    Password
                  </label>
                </div>

                <div className="login-input">
                  <div className="login-input-icon">
                    ◆
                  </div>

                  <input
                    id="login-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                className="login-submit"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="login-spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <span className="login-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            <div className="login-divider">
              <span></span>
              <p>NEW TO CONNECTCHAT?</p>
              <span></span>
            </div>

            <p className="login-register">
              Don't have an account?{" "}
              <Link to="/register">
                Create an account
              </Link>
            </p>

            <p className="login-security">
              ● Secure real-time connection
            </p>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section className="login-visual">
          <div className="visual-content">
            <div className="visual-badge">
              ● LIVE CONNECTION
            </div>

            <h2>
              Conversations
              <br />
              that feel instant.
            </h2>

            <p>
              ConnectChat brings simple and real-time
              messaging together in one place.
            </p>

            <div className="demo-chat">
              <div className="demo-user">
                <div className="demo-avatar">A</div>

                <div>
                  <h4>Amit Das</h4>
                  <span>
                    <i></i>
                    Online
                  </span>
                </div>
              </div>

              <div className="demo-message received">
                Hey! Are you there?
                <small>10:42 PM</small>
              </div>

              <div className="demo-message sent">
                Yes, what's up?
                <small>10:43 PM ✓✓</small>
              </div>

              <div className="typing-box">
                <div className="typing-avatar">A</div>

                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <p>Amit is typing...</p>
              </div>
            </div>
          </div>

          <p className="visual-footer">
            Fast • Private • Real-time
          </p>
        </section>
      </div>
    </div>
  );
}

export default Login;