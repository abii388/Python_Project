import React from "react";
import { Edit2, Trash2 } from "lucide-react";

const UsersTablePanel = ({ users, onEditUser, onDeleteUser }) => {
  return (
    <div className="animate-fade">
      <h2 className="admin-section-title">Registered User Profiles</h2>
      <div className="table-container admin-table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state-cell">
                  No registered user accounts found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td className="table-primary-text">{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.ph_no || "N/A"}</td>
                  <td>
                    <div className="action-stack">
                      <button
                        className="btn btn-secondary btn-sm icon-btn"
                        onClick={() => onEditUser(u)}
                        title="Edit User Profile"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm icon-btn"
                        onClick={() => onDeleteUser(u.id)}
                        title="Delete User profile"
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

export default UsersTablePanel;
