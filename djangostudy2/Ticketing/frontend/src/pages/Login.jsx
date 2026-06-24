import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../store/authSlice";
import Toast from "../components/Toast";
import { LogIn, User, Lock, ArrowRight } from "lucide-react";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      showToast("Please enter both username and password.", "error");
      return;
    }

    const resultAction = await dispatch(loginUser(formData));

    if (loginUser.fulfilled.match(resultAction)) {
      showToast("Logged in successfully!", "success");
      const { userRole } = resultAction.payload;
      setTimeout(() => {
        if (userRole === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 1000);
    } else {
      showToast(
        resultAction.payload || "Invalid username or password.",
        "error",
      );
    }
  };

  return (
    <div
      className="container auth-page"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="card animate-fade auth-card">
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "60px",
              height: "60px",
              borderRadius: "16px",
              background: "rgba(236, 72, 153, 0.1)",
              border: "1px solid rgba(236, 72, 153, 0.2)",
              color: "var(--secondary)",
              marginBottom: "1rem",
            }}
          >
            <LogIn size={30} />
          </div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Welcome Back</h2>
          <p
            style={{
              color: "var(--dark-text-muted)",
              fontSize: "0.95rem",
              marginTop: "4px",
            }}
          >
            Sign in to book and manage your concert tickets
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: "relative" }}>
              <User
                size={18}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--dark-text-muted)",
                }}
              />
              <input
                type="text"
                name="username"
                className="form-control"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleChange}
                style={{ paddingLeft: "2.5rem" }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "2rem" }}>
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <Lock
                size={18}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--dark-text-muted)",
                }}
              />
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                style={{ paddingLeft: "2.5rem" }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", height: "48px" }}
            disabled={loading}
          >
            {loading ? (
              "Authenticating..."
            ) : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: "2rem",
            fontSize: "0.9rem",
            color: "var(--dark-text-muted)",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/signup"
            style={{
              color: "var(--secondary)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign Up
          </Link>
        </div>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Login;
