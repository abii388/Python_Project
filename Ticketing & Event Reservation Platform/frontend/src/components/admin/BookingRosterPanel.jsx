import React from "react";
import { Info, Users } from "lucide-react";

const BookingRosterPanel = ({
  concerts,
  activeBookingsConcertId,
  selectedConcertBookings,
  onSelectConcert,
}) => {
  const totalTickets =
    selectedConcertBookings?.reduce(
      (sum, b) => sum + parseInt(b.ticket_no || 0),
      0,
    ) || 0;

  const totalReceipts =
    selectedConcertBookings?.reduce(
      (sum, b) => sum + parseFloat(b.total_price || 0),
      0,
    ) || 0;

  return (
    <div className="animate-fade booking-layout">
      <div>
        <h2 className="admin-section-title">Select a Concert</h2>
        <div className="table-container admin-table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Concert Name</th>
                <th>Tickets</th>
                <th>Select</th>
              </tr>
            </thead>
            <tbody>
              {concerts.length === 0 ? (
                <tr>
                  <td colSpan="3" className="empty-state-cell">
                    No concerts available.
                  </td>
                </tr>
              ) : (
                concerts.map((c) => (
                  <tr
                    key={c.id}
                    style={{
                      background:
                        activeBookingsConcertId === c.id
                          ? "rgba(139, 92, 246, 0.08)"
                          : "transparent",
                    }}
                  >
                    <td className="table-primary-text">{c.concert_name}</td>
                    <td>{c.available_tickets}</td>
                    <td>
                      <button
                        className={`btn btn-sm ${activeBookingsConcertId === c.id ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => onSelectConcert(c.id)}
                      >
                        Roster
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="admin-section-title">Booking Roster Details</h2>

        {selectedConcertBookings === null ? (
          <div className="card empty-card">
            <Info size={36} />
            <p>
              Select a concert from the directory roster to view user bookings
              and totals.
            </p>
          </div>
        ) : selectedConcertBookings.length === 0 ? (
          <div className="card empty-card">
            <Users size={36} />
            <p>No seats booked for this concert yet.</p>
          </div>
        ) : (
          <div className="animate-fade">
            <div className="summary-card">
              <div>
                <span className="summary-label">Total Reservations</span>
                <span className="summary-value">{totalTickets} tickets</span>
              </div>
              <div>
                <span className="summary-label">Total Receipts</span>
                <span className="summary-value success">
                  ${totalReceipts.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="table-container admin-table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Attendee Name</th>
                    <th>Tickets</th>
                    <th>Price Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedConcertBookings.map((b) => (
                    <tr key={b.id}>
                      <td className="table-primary-text">
                        {b.user_name || `User ID: ${b.user}`}
                      </td>
                      <td>{b.ticket_no} seat(s)</td>
                      <td className="table-accent-text">${b.total_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingRosterPanel;
