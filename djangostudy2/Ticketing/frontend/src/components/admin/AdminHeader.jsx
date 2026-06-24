import React from "react";
import { Settings, FileText, Users } from "lucide-react";

const AdminHeader = ({
  activeTab,
  onTabChange,
  setSelectedConcertBookings,
  setActiveBookingsConcertId,
}) => {
  const handleTabSwitch = (tab) => {
    onTabChange(tab);
    setSelectedConcertBookings(null);
    setActiveBookingsConcertId(null);
  };

  return (
    <div className="admin-header">
      <div>
        <h1 className="section-title">Admin Management Console</h1>
        <p className="section-desc">
          Manage your concert directory, view attendance lists, and edit user
          registrations
        </p>
      </div>

      <div className="admin-tabs">
        <button
          className={`btn btn-sm ${activeTab === "concerts" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => handleTabSwitch("concerts")}
        >
          <Settings size={15} /> Concert Directory
        </button>
        <button
          className={`btn btn-sm ${activeTab === "bookings" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => handleTabSwitch("bookings")}
        >
          <FileText size={15} /> Booking Rosters
        </button>
        <button
          className={`btn btn-sm ${activeTab === "users" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => handleTabSwitch("users")}
        >
          <Users size={15} /> User Database
        </button>
      </div>
    </div>
  );
};

export default AdminHeader;
