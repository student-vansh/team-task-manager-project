import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { projectAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { getId } from "../utils/helpers";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth();

  const isAdmin = user?.role === "Admin";

  const loadProjects = async () => {
    try {
      const res = await projectAPI.getMyProjects();
      setProjects(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await projectAPI.create({ name, description });
      setProjects((prev) => [res.data.project, ...prev]);
      setName("");
      setDescription("");
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Projects</h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome, {user?.name}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "+ New Project"}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

      {showForm && isAdmin && (
        <form
          onSubmit={handleCreate}
          className="bg-white border rounded-xl p-4 space-y-3"
        >
          <input
            type="text"
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Create Project
          </button>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-16 text-slate-500 bg-white border rounded-xl">
          <p className="text-lg">No projects yet</p>
          <p className="text-sm mt-1">
            {isAdmin
              ? "Create your first project to get started"
              : "Ask an admin to add you to a project"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const projectAdminId = getId(project.admin);
            const isProjectAdmin = projectAdminId === getId(user);

            return (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="bg-white border rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition"
              >
                <div className="flex items-start justify-between">
                  <h2 className="font-semibold text-lg">{project.name}</h2>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isProjectAdmin
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {isProjectAdmin ? "ADMIN" : "MEMBER"}
                  </span>
                </div>

                {project.description && (
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="flex gap-4 mt-4 text-xs text-slate-500">
                  <span>{project.members?.length || 0} members</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
