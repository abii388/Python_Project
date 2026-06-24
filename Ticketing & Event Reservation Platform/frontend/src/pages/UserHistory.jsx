import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Toast from "../components/Toast";
import {
  Ticket,
  Calendar,
  MapPin,
  Download,
  Trash2,
  ShieldAlert,
  Sparkles,
  Smile,
} from "lucide-react";

const UserHistory = () => {
  const { apiBaseUrl } = useSelector((state) => state.auth);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Cancel confirmation state
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/user_history`);
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
      showToast("Failed to load booking history.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const downloadPDF = async (bookingId, concertName) => {
    showToast("Generating your ticket PDF...", "info");
    try {
      const response = await axios.get(
        `${apiBaseUrl}/pdf_generate/${bookingId}`,
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `VibePass_${concertName.replace(/\s+/g, "_")}_Ticket.pdf`;
      link.click();
      showToast("PDF Ticket downloaded!", "success");
    } catch (error) {
      console.error("PDF download error:", error);
      showToast("Could not generate PDF ticket. Try again later.", "error");
    }
  };

  const handleCancelRequest = (id) => {
    setCancellingId(id);
  };

  const confirmCancel = async () => {
    if (!cancellingId) return;
    setCancelLoading(true);
    try {
      await axios.delete(`${apiBaseUrl}/delete_history/${cancellingId}`);
      showToast("Booking cancelled successfully.", "success");
      setBookings((prev) => prev.filter((b) => b.id !== cancellingId));
      setCancellingId(null);
    } catch (error) {
      console.error("Cancel booking error:", error);
      showToast("Failed to cancel booking.", "error");
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="container animate-fade" style={{ padding: "2rem 1.5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="section-title">My Tickets</h1>
        <p className="section-desc">
          View your active reservations, download invoices, or cancel bookings
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(255, 255, 255, 0.1)",
              borderTop: "3px solid var(--secondary)",
              borderRadius: "50%",
              animation: "pulse 1.2s infinite linear",
              display: "inline-block",
            }}
          ></div>
          <p style={{ marginTop: "1rem", color: "var(--dark-text-muted)" }}>
            Retrieving your booking history...
          </p>
        </div>
      ) : bookings.length === 0 ? (
        <div
          className="card"
          style={{ textAlign: "center", padding: "4rem 2rem" }}
        >
          <Smile
            size={48}
            style={{ color: "var(--dark-text-muted)", marginBottom: "1rem" }}
          />
          <h3>No Bookings Yet</h3>
          <p style={{ color: "var(--dark-text-muted)", marginTop: "0.5rem" }}>
            Browse live concerts to book your tickets and make memories!
          </p>
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="card history-card"
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1.5rem",
                padding: "1.5rem 2rem",
                position: "relative",
              }}
            >
              {/* Ticket border effect */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "6px",
                  background:
                    "linear-gradient(to bottom, var(--primary), var(--secondary))",
                  borderRadius: "20px 0 0 20px",
                }}
              ></div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5rem",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "56px",
                    height: "56px",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--dark-border)",
                    color: "var(--primary)",
                  }}
                >
                  <Ticket size={24} />
                </div>

                <div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "white",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {booking.concert_name}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      gap: "1.25rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--dark-text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Calendar size={14} /> {booking.concert_date} at{" "}
                      {booking.concert_time}
                    </span>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--dark-text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <MapPin size={14} /> {booking.concert_location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking Stats */}
              <div
                className="history-stats"
                style={{
                  display: "flex",
                  gap: "2.5rem",
                  borderLeft: "1px solid var(--dark-border)",
                  borderRight: "1px solid var(--dark-border)",
                  padding: "0 2.5rem",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--dark-text-muted)",
                      display: "block",
                      textTransform: "uppercase",
                    }}
                  >
                    Tickets
                  </span>
                  <span
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    {booking.ticket_no}{" "}
                    {parseInt(booking.ticket_no) === 1 ? "ticket" : "tickets"}
                  </span>
                </div>

                <div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--dark-text-muted)",
                      display: "block",
                      textTransform: "uppercase",
                    }}
                  >
                    Total Price
                  </span>
                  <span
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 800,
                      color: "var(--secondary)",
                    }}
                  >
                    ${booking.total_price}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => downloadPDF(booking.id, booking.concert_name)}
                  title="Download Invoice PDF"
                >
                  <Download size={16} /> PDF Invoice
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleCancelRequest(booking.id)}
                  title="Cancel Booking"
                >
                  <Trash2 size={16} /> Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingId && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: "400px",
              width: "100%",
              padding: "2rem",
              textAlign: "center",
            }}
          >
            <ShieldAlert
              size={48}
              style={{ color: "var(--error)", marginBottom: "1rem" }}
            />
            <h3
              style={{
                fontSize: "1.4rem",
                fontWeight: 700,
                marginBottom: "0.5rem",
                color: "white",
              }}
            >
              Cancel Booking?
            </h3>
            <p
              style={{
                color: "var(--dark-text-muted)",
                fontSize: "0.95rem",
                marginBottom: "1.5rem",
              }}
            >
              Are you sure you want to cancel this booking? This will release
              your ticket seats and refund the transaction.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setCancellingId(null)}
              >
                No, Keep it
              </button>
              <button
                type="button"
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={confirmCancel}
                disabled={cancelLoading}
              >
                {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
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

export default UserHistory;
