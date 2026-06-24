import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { store } from "./store";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ConcertList from "./pages/ConcertList";
import UserHistory from "./pages/UserHistory";
import AdminDashboard from "./pages/AdminDashboard";

// Route guard for authenticated users
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useSelector((state) => state.auth);
  const isAuthenticated = !!token;

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 0" }}>
        <p>Verifying session...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Route guard for admin-only pages
const AdminRoute = ({ children }) => {
  const { token, userRole, loading } = useSelector((state) => state.auth);
  const isAuthenticated = !!token;
  const isAdmin = userRole === "admin";

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 0" }}>
        <p>Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return isAdmin ? children : <Navigate to="/" replace />;
};

function AppContent() {
  return (
    <>
      <Navbar />
      <div style={{ flexGrow: 1 }}>
        <Routes>
          {/* Guest only routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* User authenticated routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ConcertList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <UserHistory />
              </ProtectedRoute>
            }
          />

          {/* Admin only routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <footer
        style={{
          textAlign: "center",
          padding: "2rem 1rem",
          fontSize: "0.85rem",
          color: "var(--dark-text-muted)",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          marginTop: "3rem",
          background: "rgba(0, 0, 0, 0.2)",
          lineHeight: 1.6,
        }}
      >
        <p>
          © 2026 VibePass Systems Inc. All rights reserved. Securely powered by
          Django and React Redux.
        </p>
      </footer>
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;
