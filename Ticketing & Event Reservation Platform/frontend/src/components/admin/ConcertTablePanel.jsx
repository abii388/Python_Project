import React from "react";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

const ConcertTablePanel = ({
  concerts,
  onCreateConcert,
  onEditConcert,
  onDeleteConcert,
  onToggleStatus,
}) => {
  return (
    <div className="animate-fade">
      <div className="admin-section-header">
        <h2>Current Concert Directory</h2>
        <button className="btn btn-primary btn-sm" onClick={onCreateConcert}>
          <Plus size={16} /> Add New Concert
        </button>
      </div>

      <div className="table-container admin-table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Concert Name</th>
              <th>Location</th>
              <th>Date & Time</th>
              <th>Ticket Price</th>
              <th>Tickets Left</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {concerts.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state-cell">
                  No concerts listed. Click Add New Concert to get started.
                </td>
              </tr>
            ) : (
              concerts.map((c) => (
                <tr key={c.id}>
                  <td className="table-primary-text">{c.concert_name}</td>
                  <td>{c.concert_location}</td>
                  <td>
                    {c.concert_date} at {c.concert_time}
                  </td>
                  <td className="table-accent-text">${c.prize}</td>
                  <td>
                    <span
                      className={`badge ${c.available_tickets === "sold out" ? "badge-danger" : "badge-info"}`}
                    >
                      {c.available_tickets}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => onToggleStatus(c.id)}
                      className="status-toggle"
                      title={`Toggle status (currently ${c.status})`}
                    >
                      {c.status === "Enable" ? (
                        <ToggleRight size={28} />
                      ) : (
                        <ToggleLeft size={28} />
                      )}
                      <span>{c.status}</span>
                    </button>
                  </td>
                  <td>
                    <div className="action-stack">
                      <button
                        className="btn btn-secondary btn-sm icon-btn"
                        onClick={() => onEditConcert(c)}
                        title="Edit Concert details"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm icon-btn"
                        onClick={() => onDeleteConcert(c.id)}
                        title="Delete Concert"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConcertTablePanel;
