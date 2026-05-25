import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardAPI, projectAPI } from "../services/api";

function countByStatus(tasksByStatus, status) {
  const found = tasksByStatus?.find((item) => item._id === status);
  return found?.count ?? 0;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [projectCount, setProjectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [dashboardRes, projectsRes] = await Promise.all([
        dashboardAPI.getStats(),
        projectAPI.getMyProjects(),
      ]);

      setStats(dashboardRes.data);
      setProjectCount(projectsRes.data.length);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-slate-500">Overview of your work</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card title="My Projects" value={projectCount} />
            <Card title="Total Tasks" value={stats.totalTasks} />
            <Card title="Completed" value={stats.completedTasks} />
            <Card
              title="Overdue"
              value={stats.overdueTasks}
              danger={stats.overdueTasks > 0}
            />
          </div>

          <div className="bg-white border rounded-xl p-4">
            <h2 className="font-semibold mb-3">Tasks by Status</h2>
            <div className="grid grid-cols-3 text-center gap-4">
              <Status label="To Do" value={countByStatus(stats.tasksByStatus, "To Do")} />
              <Status
                label="In Progress"
                value={countByStatus(stats.tasksByStatus, "In Progress")}
              />
              <Status label="Done" value={countByStatus(stats.tasksByStatus, "Done")} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card title="Pending Tasks" value={stats.pendingTasks} />
          </div>
        </>
      )}

      <div className="flex gap-3">
        <Link
          to="/projects"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          View Projects
        </Link>
      </div>
    </div>
  );
}

function Card({ title, value, danger }) {
  return (
    <div
      className={`bg-white border rounded-xl p-4 ${danger ? "border-red-200" : ""}`}
    >
      <p className="text-sm text-slate-500">{title}</p>
      <h2 className={`text-2xl font-bold mt-1 ${danger ? "text-red-600" : ""}`}>
        {value}
      </h2>
    </div>
  );
}

function Status({ label, value }) {
  return (
    <div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
