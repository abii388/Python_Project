import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Toast from "../components/Toast";
import AdminHeader from "../components/admin/AdminHeader";
import ConcertTablePanel from "../components/admin/ConcertTablePanel";
import BookingRosterPanel from "../components/admin/BookingRosterPanel";
import UsersTablePanel from "../components/admin/UsersTablePanel";
import { X } from "lucide-react";

const AdminDashboard = () => {
  const { apiBaseUrl } = useSelector((state) => state.auth);

  // Tab control: 'concerts' | 'bookings' | 'users'
  const [activeTab, setActiveTab] = useState("concerts");
  const [toast, setToast] = useState(null);

  // States
  const [concerts, setConcerts] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedConcertBookings, setSelectedConcertBookings] = useState(null);
  const [activeBookingsConcertId, setActiveBookingsConcertId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [showConcertModal, setShowConcertModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [concertFormData, setConcertFormData] = useState({
    id: null,
    concert_name: "",
    concert_date: "", // HTML format: YYYY-MM-DD
    concert_time: "",
    concert_location: "",
    prize: "",
    available_tickets: "",
    status: "Disable",
    image: null,
  });

  const [showUserModal, setShowUserModal] = useState(false);
  const [userFormData, setUserFormData] = useState({
    id: null,
    username: "",
    email: "",
    ph_no: "",
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "concerts" || activeTab === "bookings") {
        const response = await axios.get(`${apiBaseUrl}/retrieve_concert`);
        setConcerts(response.data);
      } else if (activeTab === "users") {
        const response = await axios.get(`${apiBaseUrl}/user_details`);
        // The API returns details with a trailing space in the key: {"The user data ": [...]}
        const userData =
          response.data["The user data "] ||
          response.data["The user data"] ||
          [];
        setUsers(userData);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
      showToast("Error retrieving admin records.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Helper: Convert DD-MM-YYYY (API) to YYYY-MM-DD (HTML Date Input)
  const apiDateToInput = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  // Helper: Convert YYYY-MM-DD (HTML Date Input) to DD-MM-YYYY (API)
  const inputDateToApi = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  // ================= CONCERT ACTIONS =================

  const handleOpenCreateConcert = () => {
    setModalMode("create");
    setConcertFormData({
      id: null,
      concert_name: "",
      concert_date: "",
      concert_time: "",
      concert_location: "",
      prize: "",
      available_tickets: "",
      status: "Disable",
      image: null,
    });
    setShowConcertModal(true);
  };

  const handleOpenEditConcert = (concert) => {
    setModalMode("edit");
    setConcertFormData({
      id: concert.id,
      concert_name: concert.concert_name,
      concert_date: apiDateToInput(concert.concert_date),
      concert_time: concert.concert_time,
      concert_location: concert.concert_location,
      prize: concert.prize,
      available_tickets: concert.available_tickets,
      status: concert.status,
      image: concert.image || null,
    });
    setShowConcertModal(true);
  };

  const handleConcertFormSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("concert_name", concertFormData.concert_name);
    formData.append(
      "concert_date",
      inputDateToApi(concertFormData.concert_date),
    );
    formData.append("concert_time", concertFormData.concert_time);
    formData.append("concert_location", concertFormData.concert_location);
    formData.append("prize", parseFloat(concertFormData.prize));
    formData.append("available_tickets", concertFormData.available_tickets);
    formData.append("status", concertFormData.status);

    if (concertFormData.image instanceof File) {
      formData.append("image", concertFormData.image);
    }

    try {
      if (modalMode === "create") {
        await axios.post(`${apiBaseUrl}/createconcert`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("Concert created successfully!", "success");
      } else {
        await axios.put(
          `${apiBaseUrl}/concert_details/${concertFormData.id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        showToast("Concert updated successfully!", "success");
      }
      setShowConcertModal(false);
      fetchData();
    } catch (error) {
      console.error("Concert save error:", error);
      const errors = error.response?.data;
      const errMsg = errors
        ? Object.entries(errors)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" | ")
        : "Failed to save concert.";
      showToast(errMsg, "error");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await axios.get(`${apiBaseUrl}/status_update/${id}`);
      showToast(response.data.message || "Status updated!", "success");
      setConcerts((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, status: c.status === "Enable" ? "Disable" : "Enable" }
            : c,
        ),
      );
    } catch (error) {
      console.error("Toggle status error:", error);
      showToast("Failed to update status.", "error");
    }
  };

  const handleDeleteConcert = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this concert? This action is irreversible.",
      )
    )
      return;
    try {
      await axios.delete(`${apiBaseUrl}/concert_details/${id}`);
      showToast("Concert deleted successfully.", "success");
      setConcerts((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Delete concert error:", error);
      showToast("Failed to delete concert.", "error");
    }
  };

  // ================= BOOKINGS ACTIONS =================

  const fetchBookingsForConcert = async (concertId) => {
    setLoading(true);
    setActiveBookingsConcertId(concertId);
    try {
      const response = await axios.get(
        `${apiBaseUrl}/booked_concert_details/${concertId}`,
      );
      setSelectedConcertBookings(response.data.data);
    } catch (error) {
      console.error("Bookings fetch error:", error);
      setSelectedConcertBookings([]);
      if (error.response && error.response.status === 404) {
        showToast("No bookings found for this concert.", "warning");
      } else {
        showToast("Failed to retrieve bookings.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // ================= USER ACTIONS =================

  const handleOpenEditUser = (user) => {
    setUserFormData({
      id: user.id,
      username: user.username,
      email: user.email,
      ph_no: user.ph_no || "",
    });
    setShowUserModal(true);
  };

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    if (userFormData.ph_no.length !== 10 || isNaN(userFormData.ph_no)) {
      showToast("Phone number must be exactly 10 digits.", "error");
      return;
    }

    try {
      await axios.put(`${apiBaseUrl}/user_view/${userFormData.id}`, {
        username: userFormData.username,
        email: userFormData.email,
        ph_no: userFormData.ph_no,
      });
      showToast("User record updated successfully!", "success");
      setShowUserModal(false);
      fetchData();
    } catch (error) {
      console.error("User update error:", error);
      showToast("Failed to update user records.", "error");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user profile?"))
      return;
    try {
      await axios.delete(`${apiBaseUrl}/user_view/${id}`);
      showToast("User record deleted successfully.", "success");
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error("Delete user error:", error);
      showToast("Failed to delete user profile.", "error");
    }
  };

  return (
    <div className="container animate-fade admin-page">
      <AdminHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        setSelectedConcertBookings={setSelectedConcertBookings}
        setActiveBookingsConcertId={setActiveBookingsConcertId}
      />

      {/* Main Tab Content */}
      {loading && !showConcertModal && !showUserModal && (
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(255, 255, 255, 0.1)",
              borderTop: "3px solid var(--primary)",
              borderRadius: "50%",
              animation: "pulse 1.2s infinite linear",
              display: "inline-block",
            }}
          ></div>
          <p style={{ marginTop: "1rem", color: "var(--dark-text-muted)" }}>
            Retrieving administrative records...
          </p>
        </div>
      )}

      {!loading && activeTab === "concerts" && (
        <ConcertTablePanel
          concerts={concerts}
          onCreateConcert={handleOpenCreateConcert}
          onEditConcert={handleOpenEditConcert}
          onDeleteConcert={handleDeleteConcert}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {!loading && activeTab === "bookings" && (
        <BookingRosterPanel
          concerts={concerts}
          activeBookingsConcertId={activeBookingsConcertId}
          selectedConcertBookings={selectedConcertBookings}
          onSelectConcert={fetchBookingsForConcert}
        />
      )}

      {!loading && activeTab === "users" && (
        <UsersTablePanel
          users={users}
          onEditUser={handleOpenEditUser}
          onDeleteUser={handleDeleteUser}
        />
      )}

      {/* Concert Creator / Editor Modal */}
      {showConcertModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="card animate-fade"
            style={{
              maxWidth: "500px",
              width: "100%",
              padding: "2rem",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => setShowConcertModal(false)}
              style={{
                position: "absolute",
                top: "1.5rem",
                right: "1.5rem",
                background: "none",
                border: "none",
                color: "var(--dark-text-muted)",
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>

            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                marginBottom: "1.5rem",
                color: "white",
              }}
            >
              {modalMode === "create"
                ? "List New Concert"
                : "Edit Concert Listing"}
            </h3>

            <form onSubmit={handleConcertFormSubmit}>
              <div className="form-group">
                <label className="form-label">Concert Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Neon Horizon Tour"
                  value={concertFormData.concert_name}
                  onChange={(e) =>
                    setConcertFormData({
                      ...concertFormData,
                      concert_name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div className="form-group">
                  <label className="form-label">Concert Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={concertFormData.concert_date}
                    onChange={(e) =>
                      setConcertFormData({
                        ...concertFormData,
                        concert_date: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Concert Time</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 7:30 PM"
                    value={concertFormData.concert_time}
                    onChange={(e) =>
                      setConcertFormData({
                        ...concertFormData,
                        concert_time: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location Venue</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Madison Square Garden"
                  value={concertFormData.concert_location}
                  onChange={(e) =>
                    setConcertFormData({
                      ...concertFormData,
                      concert_location: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div className="form-group">
                  <label className="form-label">Ticket Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="e.g. 89.99"
                    value={concertFormData.prize}
                    onChange={(e) =>
                      setConcertFormData({
                        ...concertFormData,
                        prize: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Available Tickets</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 250"
                    value={concertFormData.available_tickets}
                    onChange={(e) =>
                      setConcertFormData({
                        ...concertFormData,
                        available_tickets: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Concert Image (URL)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Optional image URL for the concert"
                  value={concertFormData.image || ""}
                  onChange={(e) =>
                    setConcertFormData({
                      ...concertFormData,
                      image: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Listing Status</label>
                <select
                  className="form-control"
                  value={concertFormData.status}
                  onChange={(e) =>
                    setConcertFormData({
                      ...concertFormData,
                      status: e.target.value,
                    })
                  }
                  style={{ background: "#1c1c24" }}
                >
                  <option value="Disable">
                    Disabled (Hidden from user listings)
                  </option>
                  <option value="Enable">Enabled (Publicly bookable)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Concert Image</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) =>
                    setConcertFormData({
                      ...concertFormData,
                      image: e.target.files?.[0] || null,
                    })
                  }
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "2rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowConcertModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Save Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Editor Modal */}
      {showUserModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="card animate-fade"
            style={{
              maxWidth: "450px",
              width: "100%",
              padding: "2rem",
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowUserModal(false)}
              style={{
                position: "absolute",
                top: "1.5rem",
                right: "1.5rem",
                background: "none",
                border: "none",
                color: "var(--dark-text-muted)",
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>

            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                marginBottom: "1.5rem",
                color: "white",
              }}
            >
              Edit User Profile
            </h3>

            <form onSubmit={handleUserFormSubmit}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={userFormData.username}
                  onChange={(e) =>
                    setUserFormData({
                      ...userFormData,
                      username: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email address</label>
                <input
                  type="email"
                  className="form-control"
                  value={userFormData.email}
                  onChange={(e) =>
                    setUserFormData({ ...userFormData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number (10 digits)</label>
                <input
                  type="text"
                  maxLength="10"
                  className="form-control"
                  value={userFormData.ph_no}
                  onChange={(e) =>
                    setUserFormData({ ...userFormData, ph_no: e.target.value })
                  }
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "2rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowUserModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Save User Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default AdminDashboard;
