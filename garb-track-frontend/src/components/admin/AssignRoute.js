import React, { useState, useEffect } from "react";
import "./AssignRoute.css";

function AssignRoute() {
  const [routeName, setRouteName] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [instructions, setInstructions] = useState("");
  const [assignToAll, setAssignToAll] = useState(true);
  const [collectorId, setCollectorId] = useState("");
  const [collectors, setCollectors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  // Fetch collectors list (for admin to assign individually)
  useEffect(() => {
    async function fetchCollectors() {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/users?role=collector", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch collectors");
        const data = await res.json();
        setCollectors(data);
      } catch (err) {
        console.error(err);
        setCollectors([]);
      }
    }
    fetchCollectors();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    const payload = {
      route_name: routeName,
      schedule_date: scheduleDate,
      instructions,
    };

    if (assignToAll) {
      payload.assign_all = true;
    } else {
      payload.collector_id = collectorId;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/admin/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to assign route");
      }

      setMessage(assignToAll
        ? "✅ Route successfully assigned to all collectors!"
        : "✅ Route successfully assigned to the selected collector!"
      );
      setRouteName("");
      setScheduleDate("");
      setInstructions("");
      setCollectorId("");
      setAssignToAll(true);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error assigning route. " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="assign-route-container">
      <h2>Assign Route</h2>
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

        <label>Assign To</label>
        <select
          value={assignToAll ? "all" : collectorId}
          onChange={(e) => {
            if (e.target.value === "all") {
              setAssignToAll(true);
              setCollectorId("");
            } else {
              setAssignToAll(false);
              setCollectorId(e.target.value);
            }
          }}
        >
          <option value="all">All Collectors</option>
          {collectors.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} (ID: {c.id})
            </option>
          ))}
        </select>

        <button type="submit" disabled={submitting}>
          {submitting ? "Assigning..." : "Assign Route"}
        </button>
      </form>

      {message && <p className="form-message">{message}</p>}
    </div>
  );
}

export default AssignRoute;
