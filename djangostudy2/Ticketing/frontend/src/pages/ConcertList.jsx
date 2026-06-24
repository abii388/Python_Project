import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Toast from "../components/Toast";
import {
  Search,
  Calendar,
  MapPin,
  Clock,
  Ticket,
  AlertCircle,
  ShoppingBag,
  X,
} from "lucide-react";

const ConcertList = () => {
  const { apiBaseUrl } = useSelector((state) => state.auth);
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

  // Booking Modal State
  const [selectedConcert, setSelectedConcert] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchConcerts();
  }, []);

  const fetchConcerts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/retrieve_concert`);
      setConcerts(response.data);
    } catch (error) {
      console.error("Error fetching concerts:", error);
      showToast("Failed to load concerts.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchConcerts();
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${apiBaseUrl}/search?search=${encodeURIComponent(searchQuery)}`,
      );
      setConcerts(response.data);
    } catch (error) {
      console.error("Search error:", error);
      if (error.response && error.response.status === 404) {
        setConcerts([]);
        showToast("No exact matches found for your search.", "warning");
      } else {
        showToast("Search request failed.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const openBookingModal = (concert) => {
    if (
      concert.available_tickets === "sold out" ||
      parseInt(concert.available_tickets) <= 0
    ) {
      showToast("This concert is sold out.", "error");
      return;
    }
    setSelectedConcert(concert);
    setTicketCount(1);
  };

  const closeBookingModal = () => {
    setSelectedConcert(null);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedConcert) return;

    if (ticketCount < 1 || ticketCount > 3) {
      showToast("You can book between 1 and 3 tickets only.", "error");
      return;
    }

    setBookingLoading(true);
    try {
      const response = await axios.post(
        `${apiBaseUrl}/confirm_concert/${selectedConcert.id}`,
        {
          ticket_no: ticketCount,
        },
      );

      showToast(
        response.data.message || "Tickets booked successfully!",
        "success",
      );
      closeBookingModal();
      fetchConcerts(); // refresh counts
    } catch (error) {
      console.error("Booking error:", error);
      const errMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Booking failed.";
      showToast(errMsg, "error");
    } finally {
      setBookingLoading(false);
    }
  };

  // Only show active (enabled) concerts to users
  const activeConcerts = concerts.filter((c) => c.status === "Enable");

  return (
    <div className="container animate-fade" style={{ padding: "2rem 1.5rem" }}>
      <div
        className="concert-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 className="section-title">Live Concerts</h1>
          <p className="section-desc">
            Discover and secure tickets to the hottest music shows in town
          </p>
        </div>

        <form
          className="concert-search"
          onSubmit={handleSearch}
          style={{
            display: "flex",
            gap: "8px",
            maxWidth: "400px",
            width: "100%",
            position: "relative",
          }}
        >
          <div style={{ position: "relative", flexGrow: 1 }}>
            <Search
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
              className="form-control"
              placeholder="Search exact name, location, or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
          {searchQuery && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearchQuery("");
                fetchConcerts();
              }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {loading ? (
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
            Loading live shows...
          </p>
        </div>
      ) : activeConcerts.length === 0 ? (
        <div
          className="card"
          style={{ textAlign: "center", padding: "4rem 2rem" }}
        >
          <AlertCircle
            size={48}
            style={{ color: "var(--dark-text-muted)", marginBottom: "1rem" }}
          />
          <h3>No Live Concerts Found</h3>
          <p style={{ color: "var(--dark-text-muted)", marginTop: "0.5rem" }}>
            Check back later or search for another term. Note: Search is exact
            match.
          </p>
          <button
            className="btn btn-outline"
            onClick={fetchConcerts}
            style={{ marginTop: "1.5rem" }}
          >
            Reload Concerts
          </button>
        </div>
      ) : (
        <div
          className="concert-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "2rem",
          }}
        >
          {activeConcerts.map((concert) => {
            const isSoldOut =
              concert.available_tickets === "sold out" ||
              parseInt(concert.available_tickets) <= 0;
            return (
              <div key={concert.id} className="card concert-card">
                <div
                  className="concert-card-glow"
                  style={{
                    background: isSoldOut
                      ? "linear-gradient(90deg, #f43f5e, #be123c)"
                      : "linear-gradient(90deg, var(--primary), var(--secondary))",
                  }}
                ></div>

                <div className="concert-image-wrap">
                  {concert.image ? (
                    <img
                      src={concert.image}
                      alt={concert.concert_name}
                      className="concert-image"
                    />
                  ) : (
                    <div className="concert-image-placeholder">
                      <Ticket size={28} />
                      <span>Live Show</span>
                    </div>
                  )}
                </div>

                <div className="concert-card-body">
                  <div className="concert-card-header">
                    <h3>{concert.concert_name}</h3>
                    <span
                      className={`badge ${isSoldOut ? "badge-danger" : "badge-success"}`}
                    >
                      {isSoldOut
                        ? "Sold Out"
                        : `${concert.available_tickets} left`}
                    </span>
                  </div>

                  <div className="concert-meta-list">
                    <div className="concert-meta-item">
                      <Calendar size={16} />
                      <span>{concert.concert_date}</span>
                    </div>
                    <div className="concert-meta-item">
                      <Clock size={16} />
                      <span>{concert.concert_time}</span>
                    </div>
                    <div className="concert-meta-item">
                      <MapPin size={16} />
                      <span>{concert.concert_location}</span>
                    </div>
                  </div>
                </div>

                <div className="concert-card-footer">
                  <div>
                    <span className="concert-price-label">Ticket Price</span>
                    <span className="concert-price">${concert.prize}</span>
                  </div>

                  <button
                    className={`btn ${isSoldOut ? "btn-secondary" : "btn-primary"} btn-sm`}
                    onClick={() => openBookingModal(concert)}
                    disabled={isSoldOut}
                  >
                    <ShoppingBag size={16} />
                    {isSoldOut ? "Sold Out" : "Book Now"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Modal */}
      {selectedConcert && (
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
            animation: "fadeIn 0.25s ease-out",
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: "480px",
              width: "100%",
              padding: "2rem",
              position: "relative",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)",
            }}
          >
            <button
              onClick={closeBookingModal}
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
                marginBottom: "0.5rem",
                color: "white",
              }}
            >
              Book Tickets
            </h3>
            <p
              style={{
                color: "var(--dark-text-muted)",
                fontSize: "0.9rem",
                marginBottom: "1.5rem",
              }}
            >
              Confirm your reservation for{" "}
              <strong>{selectedConcert.concert_name}</strong>
            </p>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--dark-border)",
                borderRadius: "12px",
                padding: "1rem",
                marginBottom: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.9rem",
                }}
              >
                <span style={{ color: "var(--dark-text-muted)" }}>
                  Location:
                </span>
                <span style={{ fontWeight: 600 }}>
                  {selectedConcert.concert_location}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.9rem",
                }}
              >
                <span style={{ color: "var(--dark-text-muted)" }}>
                  Date & Time:
                </span>
                <span style={{ fontWeight: 600 }}>
                  {selectedConcert.concert_date} at{" "}
                  {selectedConcert.concert_time}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.9rem",
                }}
              >
                <span style={{ color: "var(--dark-text-muted)" }}>
                  Available tickets:
                </span>
                <span style={{ fontWeight: 600 }}>
                  {selectedConcert.available_tickets}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.9rem",
                }}
              >
                <span style={{ color: "var(--dark-text-muted)" }}>
                  Price per ticket:
                </span>
                <span style={{ fontWeight: 600, color: "var(--secondary)" }}>
                  ${selectedConcert.prize}
                </span>
              </div>
            </div>

            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label className="form-label">Number of Tickets (Max 3)</label>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: "0.5rem 1rem", fontSize: "1.2rem" }}
                    onClick={() =>
                      setTicketCount((prev) => Math.max(1, prev - 1))
                    }
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="form-control"
                    style={{
                      textAlign: "center",
                      fontSize: "1.2rem",
                      fontWeight: 700,
                    }}
                    value={ticketCount}
                    readOnly
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: "0.5rem 1rem", fontSize: "1.2rem" }}
                    onClick={() =>
                      setTicketCount((prev) =>
                        Math.min(
                          3,
                          Math.min(
                            parseInt(selectedConcert.available_tickets),
                            prev + 1,
                          ),
                        ),
                      )
                    }
                  >
                    +
                  </button>
                </div>
                <small
                  style={{ color: "var(--dark-text-muted)", marginTop: "4px" }}
                >
                  Limits: 3 tickets maximum per user.
                </small>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  margin: "1.5rem 0",
                  borderTop: "1px solid var(--dark-border)",
                  paddingTop: "1.25rem",
                }}
              >
                <span
                  style={{ fontWeight: 600, color: "var(--dark-text-muted)" }}
                >
                  Total Cost:
                </span>
                <span
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 800,
                    color: "white",
                  }}
                >
                  $
                  {(ticketCount * parseFloat(selectedConcert.prize)).toFixed(2)}
                </span>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={closeBookingModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? "Processing..." : "Confirm Reservation"}
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

export default ConcertList;
