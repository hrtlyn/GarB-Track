import React, { useState, useEffect, useCallback } from "react";
import "./AssignRoute.css";

function AssignRoute() {
  const [routeName, setRouteName] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [instructions, setInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);

  // Filter & Search
  const [filterDate, setFilterDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalStatus, setModalStatus] = useState("loading");

  // Delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Edit confirmation
  const [editRouteId, setEditRouteId] = useState(null);
  const [showEditConfirm, setShowEditConfirm] = useState(false);

  const token = localStorage.getItem("token");

  const openModal = (message, status = "success") => {
    setModalMessage(message);
    setModalStatus("loading");
    setShowModal(true);

    setTimeout(() => {
      setModalStatus(status);
      setTimeout(() => setShowModal(false), 1500);
    }, 800);
  };

  // Fetch routes
  const fetchRoutes = useCallback(async () => {
    setLoadingRoutes(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/routes/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRoutes(data);
      } else {
        console.error("Failed to fetch route history");
      }
    } catch (err) {
      console.error("Error fetching route history:", err);
    } finally {
      setLoadingRoutes(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  // Filter & search logic
  useEffect(() => {
    let tempRoutes = [...routes];

    if (filterDate) {
      tempRoutes = tempRoutes.filter(route => route.schedule_date === filterDate);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      tempRoutes = tempRoutes.filter(route =>
        route.route_name.toLowerCase().includes(term) ||
        (route.collector?.name || "All Collectors").toLowerCase().includes(term)
      );
    }

    setFilteredRoutes(tempRoutes);
  }, [routes, filterDate, searchTerm]);

  // Assign new route
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editRouteId) {
      setShowEditConfirm(true);
      return;
    }

    setSubmitting(true);

    const payload = {
      route_name: routeName,
      schedule_date: scheduleDate,
      instructions,
      assign_all: true,
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to assign route");

      openModal("Route successfully assigned to all collectors!", "success");

      // Refetch routes
      fetchRoutes();

      setRouteName("");
      setScheduleDate("");
      setInstructions("");
    } catch (err) {
      console.error(err);
      openModal("❌ Error assigning route. " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete route
  const handleDeleteRoute = (id) => setConfirmDeleteId(id);

  const confirmDelete = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/routes/${confirmDeleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setRoutes((prev) => prev.filter((r) => r.id !== confirmDeleteId));
        openModal("Route deleted successfully!", "success");
        setConfirmDeleteId(null);
      } else openModal("Failed to delete route", "error");
    } catch (err) {
      console.error(err);
      openModal("Failed to delete route", "error");
    }
  };

  // Edit route
  const openEditModal = (route) => {
    setEditRouteId(route.id);
    setRouteName(route.route_name);
    setScheduleDate(route.schedule_date);
    setInstructions(route.instructions);
  };

  const handleEditSubmit = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/routes/${editRouteId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          route_name: routeName,
          schedule_date: scheduleDate,
          instructions,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update route");

      openModal("Route updated successfully!", "success");

      fetchRoutes();
      cancelEdit();
      setShowEditConfirm(false);
    } catch (err) {
      console.error(err);
      openModal("❌ Error updating route. " + err.message, "error");
      setShowEditConfirm(false);
    }
  };

  const cancelEdit = () => {
    setEditRouteId(null);
    setRouteName("");
    setScheduleDate("");
    setInstructions("");
  };

  return (
    <div className="assign-route-page">
      {/* Assign / Edit Form */}
      <div className="assign-route-container">
        <h2>{editRouteId ? "Edit Route" : "Assign Route"}</h2>
        <form onSubmit={handleSubmit}>
          <label>Route Name</label>
          <input
            type="text"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            placeholder="e.g., Zone 3 - West Side"
            required
          />

          <label>Schedule Date</label>
          <input
            type="date"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            required
          />

          <label>Instructions</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Enter special collection instructions..."
            rows="4"
            required
          />

          <div className="button-group">
            <button type="submit" disabled={submitting}>
              {editRouteId ? "Save Changes" : submitting ? "Assigning..." : "Assign Route"}
            </button>
            {editRouteId && (
              <button type="button" className="btn-cancel" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Route History */}
      <div className="route-history-container">
        <h2>Assigned Route History</h2>

        {/* 🔹 Filters (single line) */}
        <div
          className="table-filters"
          style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}
        >
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <input
            type="text"
            placeholder="Search Zone or Collector"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loadingRoutes ? (
          <p>Fetching route history...</p>
        ) : filteredRoutes.length === 0 ? (
          <p>No routes found.</p>
        ) : (
          <table className="route-history-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Collector</th>
                <th>Route Name</th>
                <th>Date</th>
                <th>Instructions</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoutes.map((route) => (
                <tr key={route.id}>
                  <td>{route.id}</td>
                  <td>{route.collector?.name || "All Collectors"}</td>
                  <td>{route.route_name}</td>
                  <td>{route.schedule_date}</td>
                  <td>{route.instructions}</td>
                  <td>
                    <button className="edit-btn" onClick={() => openEditModal(route)}>
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteRoute(route.id)}
                      style={{ marginLeft: "0.5rem" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Modal */}
      {confirmDeleteId && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>Are you sure you want to delete this route?</p>
            <button className="btn-delete" onClick={confirmDelete}>
              Yes, Delete
            </button>
            <button className="btn-cancel" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Confirmation Modal */}
      {showEditConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>Are you sure you want to save these changes?</p>
            <button className="btn-review" onClick={handleEditSubmit}>
              Yes, Save
            </button>
            <button className="btn-cancel" onClick={() => setShowEditConfirm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* General Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            {modalStatus === "loading" && <div className="loader"></div>}
            {modalStatus === "success" && <div className="checkmark">✔</div>}
            {modalStatus === "error" && <div className="xmark">✖</div>}
            <p>{modalMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignRoute;
