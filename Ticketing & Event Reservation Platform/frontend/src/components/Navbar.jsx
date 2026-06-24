import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../store/authSlice";
import {
  LogOut,
  Calendar,
  Ticket,
  User as UserIcon,
  ShieldAlert,
} from "lucide-react";

const Navbar = () => {
  const { token, userRole, username } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAuthenticated = !!token;
  const isAdmin = userRole === "admin";

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <nav
      style={{
        background: "rgba(9, 9, 11, 0.7)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        padding: "1.2rem 0",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: "none",
            fontSize: "1.6rem",
            fontWeight: 800,
            background: "linear-gradient(135deg, #a78bfa, #ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.5px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Ticket size={28} style={{ stroke: "url(#brand-gradient)" }} />
          VibePass
          <svg width="0" height="0">
            <linearGradient
              id="brand-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </svg>
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {isAuthenticated ? (
            <>
              {isAdmin ? (
                <Link
                  to="/admin"
                  style={{
                    color: "white",
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(139, 92, 246, 0.1)",
                    border: "1px solid rgba(139, 92, 246, 0.2)",
                  }}
                >
                  <ShieldAlert size={16} /> Admin Panel
                </Link>
              ) : (
                <>
                  <Link
                    to="/"
                    style={{
                      color: "var(--dark-text-muted)",
                      textDecoration: "none",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "white")}
                    onMouseLeave={(e) =>
                      (e.target.style.color = "var(--dark-text-muted)")
                    }
                  >
                    <Calendar size={16} /> Browse Concerts
                  </Link>
                  <Link
                    to="/history"
                    style={{
                      color: "var(--dark-text-muted)",
                      textDecoration: "none",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "white")}
                    onMouseLeave={(e) =>
                      (e.target.style.color = "var(--dark-text-muted)")
                    }
                  >
                    <Ticket size={16} /> My Tickets
                  </Link>
                </>
              )}

              <span
                style={{
                  color: "white",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <UserIcon size={14} /> {username}
              </span>

              <button
                className="btn btn-secondary btn-sm"
                onClick={handleLogout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                }}
              >
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  color: "var(--dark-text-muted)",
                  textDecoration: "none",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => (e.target.style.color = "white")}
                onMouseLeave={(e) =>
                  (e.target.style.color = "var(--dark-text-muted)")
                }
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="btn btn-primary btn-sm"
                style={{ padding: "8px 16px" }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
