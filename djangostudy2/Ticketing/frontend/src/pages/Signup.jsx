import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signupUser } from "../store/authSlice";
import Toast from "../components/Toast";
import { UserPlus, User, Mail, Lock, Phone, ArrowRight } from "lucide-react";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    ph_no: "",
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

    // Client-side validations
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirm_password ||
      !formData.ph_no
    ) {
      showToast("All fields are required.", "error");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      showToast("Passwords do not match.", "error");
      return;
    }

    if (formData.ph_no.length !== 10 || isNaN(formData.ph_no)) {
      showToast("Phone number must be exactly 10 digits.", "error");
      return;
    }

    const resultAction = await dispatch(signupUser(formData));

    if (signupUser.fulfilled.match(resultAction)) {
      showToast("Account created successfully! Redirecting...", "success");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } else {
      showToast(resultAction.payload || "Failed to register account.", "error");
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
      <div
        className="card animate-fade auth-card"
        style={{ maxWidth: "450px" }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "60px",
              height: "60px",
              borderRadius: "16px",
              background: "rgba(139, 92, 246, 0.1)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              color: "var(--primary)",
              marginBottom: "1rem",
            }}
          >
            <UserPlus size={30} />
          </div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800 }}>
            Create an Account
          </h2>
          <p
            style={{
              color: "var(--dark-text-muted)",
              fontSize: "0.95rem",
              marginTop: "4px",
            }}
          >
            Join VibePass to book live concert tickets instantly
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
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                style={{ paddingLeft: "2.5rem" }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail
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
                type="email"
                name="email"
                className="form-control"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                style={{ paddingLeft: "2.5rem" }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div style={{ position: "relative" }}>
              <Phone
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
                type="tel"
                name="ph_no"
                className="form-control"
                placeholder="9876543210"
                value={formData.ph_no}
                onChange={handleChange}
                maxLength="10"
                style={{ paddingLeft: "2.5rem" }}
                required
              />
            </div>
          </div>

          <div className="form-group">
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
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                style={{ paddingLeft: "2.5rem" }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
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
                name="confirm_password"
                className="form-control"
                placeholder="••••••••"
                value={formData.confirm_password}
                onChange={handleChange}
                style={{ paddingLeft: "2.5rem" }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "1.5rem", height: "48px" }}
            disabled={loading}
          >
            {loading ? (
              "Creating Account..."
            ) : (
              <>
                Sign Up <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            fontSize: "0.9rem",
            color: "var(--dark-text-muted)",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "var(--primary)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign In
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

export default Signup;
