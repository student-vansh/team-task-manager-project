import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { projectAPI, taskAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import { getId, isProjectAdmin } from "../utils/helpers";

const emptyTask = {
  title: "",
  description: "",
  dueDate: "",
  priority: "Medium",
  assignedTo: "",
};

const TASK_STATUSES = ["To Do", "In Progress", "Done"];
const TASK_PRIORITIES = ["Low", "Medium", "High"];

function buildProjectStats(tasks) {
  const now = new Date();
  return {
    totalTasks: tasks.length,
    overdue: tasks.filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate) < now &&
        t.status !== "Done",
    ).length,
    byStatus: TASK_STATUSES.reduce((acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status).length;
      return acc;
    }, {}),
  };
}

export default function ProjectDetails() {
  const { projectId } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState("tasks");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [memberEmail, setMemberEmail] = useState("");

  const isGlobalAdmin = user?.role === "Admin";
  const isAdmin = project && isProjectAdmin(project, user?._id);

  const load = useCallback(async () => {
    setError("");
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        projectAPI.getMyProjects(),
        taskAPI.getByProject(projectId),
      ]);

      const found = projectsRes.data.find(
        (p) => getId(p._id) === getId(projectId),
      );

      if (!found) {
        setProject(null);
        setTasks([]);
        setStats(null);
        return;
      }

      setProject(found);
      setTasks(tasksRes.data);
      setStats(buildProjectStats(tasksRes.data));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await taskAPI.create(projectId, {
        title: taskForm.title,
        description: taskForm.description,
        dueDate: taskForm.dueDate || null,
        priority: taskForm.priority,
        assignedTo: taskForm.assignedTo || null,
      });
      setTaskForm(emptyTask);
      setShowTaskForm(false);
      setLoading(true);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, status) => {
    setError("");
    try {
      await taskAPI.updateStatus(taskId, status);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Delete this task?")) return;
    setError("");

    try {
      await taskAPI.delete(taskId);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete task");
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await projectAPI.addMember(projectId, memberEmail.trim());
      setMemberEmail("");
      setLoading(true);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm("Remove this member?")) return;
    setError("");

    try {
      await projectAPI.removeMember(projectId, userId);
      setLoading(true);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove member");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12 bg-white border rounded-xl">
        <p className="text-slate-600">Project not found</p>
        <Link
          to="/projects"
          className="text-blue-600 mt-2 inline-block hover:underline"
        >
          Back to projects
        </Link>
      </div>
    );
  }

  const members = project.members || [];

  return (
    <div className="space-y-6">
      <Link
        to="/projects"
        className="text-sm text-blue-600 hover:underline inline-block"
      >
        ← Back to projects
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-slate-600 mt-1">{project.description}</p>
          )}
          <span
            className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${
              isAdmin
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {isAdmin ? "PROJECT ADMIN" : "MEMBER"}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-500">
            ×
          </button>
        </div>
      )}

      <div className="flex gap-2 border-b">
        {["tasks", "overview", ...(isGlobalAdmin && isAdmin ? ["members"] : [])].map(
          (t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px ${
                tab === t
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t}
            </button>
          ),
        )}
      </div>

      {tab === "overview" && stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Tasks" value={stats.totalTasks} />
          <StatCard
            label="Overdue"
            value={stats.overdue}
            highlight={stats.overdue > 0}
          />
          {TASK_STATUSES.map((status) => (
            <StatCard
              key={status}
              label={status}
              value={stats.byStatus[status]}
            />
          ))}
        </div>
      )}

      {tab === "members" && isGlobalAdmin && isAdmin && (
        <div>
          <form onSubmit={handleAddMember} className="flex gap-2 mb-6">
            <input
              type="email"
              placeholder="Member email address"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              required
              className="flex-1 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Add Member
            </button>
          </form>

          <div className="bg-white border rounded-xl divide-y">
            {members.map((m) => (
              <div
                key={m._id}
                className="flex items-center justify-between p-4"
              >
                <div>
                  <p className="font-medium">{m.name}</p>
                  <p className="text-sm text-slate-500">{m.email}</p>
                </div>
                {getId(m._id) !== getId(project.admin) && (
                  <button
                    onClick={() => handleRemoveMember(m._id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "tasks" && (
        <div>
          {isGlobalAdmin && (
            <div className="mb-4">
              <button
                onClick={() => {
                  setShowTaskForm(!showTaskForm);
                  setTaskForm(emptyTask);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                {showTaskForm ? "Cancel" : "+ New Task"}
              </button>
            </div>
          )}

          {showTaskForm && isGlobalAdmin && (
            <TaskForm
              form={taskForm}
              setForm={setTaskForm}
              members={members}
              onSubmit={handleCreateTask}
              submitLabel="Create Task"
            />
          )}

          {tasks.length === 0 ? (
            <p className="text-center py-12 text-slate-500 bg-white border rounded-xl">
              No tasks yet
            </p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task._id} className="bg-white border rounded-xl p-4">
                  <TaskCard
                    task={task}
                    userId={user?._id}
                    canDelete={isGlobalAdmin}
                    onStatusChange={(status) =>
                      handleUpdateStatus(task._id, status)
                    }
                    onDelete={() => handleDeleteTask(task._id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <div
      className={`bg-white border rounded-xl p-4 ${highlight ? "border-red-200" : ""}`}
    >
      <p className="text-sm text-slate-500">{label}</p>
      <p
        className={`text-3xl font-bold mt-1 ${highlight ? "text-red-600" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function TaskCard({ task, userId, canDelete, onStatusChange, onDelete }) {
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "Done";

  const isAssignee = getId(task.assignedTo) === getId(userId);

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-slate-600 mt-1">{task.description}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
        {task.assignedTo && (
          <span>Assigned to: {task.assignedTo.name}</span>
        )}
        {task.dueDate && (
          <span className={isOverdue ? "text-red-600 font-medium" : ""}>
            Due: {new Date(task.dueDate).toLocaleDateString()}
            {isOverdue && " (Overdue)"}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 mt-3 pt-3 border-t">
        {isAssignee ? (
          <select
            value={task.status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-xs text-slate-500">
            Only the assignee can update status
          </p>
        )}

        {canDelete && (
          <button
            onClick={onDelete}
            className="text-sm text-red-600 hover:underline"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

function TaskForm({ form, setForm, members, onSubmit, submitLabel }) {
  const update = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border rounded-xl p-4 mb-6 space-y-3"
    >
      <input
        type="text"
        placeholder="Task title"
        value={form.title}
        onChange={(e) => update("title", e.target.value)}
        required
        className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
      />

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => update("description", e.target.value)}
        rows={2}
        className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="date"
          value={form.dueDate}
          onChange={(e) => update("dueDate", e.target.value)}
          className="px-3 py-2 border rounded-lg"
        />

        <select
          value={form.priority}
          onChange={(e) => update("priority", e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p} Priority
            </option>
          ))}
        </select>

        <select
          value={form.assignedTo}
          onChange={(e) => update("assignedTo", e.target.value)}
          className="px-3 py-2 border rounded-lg sm:col-span-2"
        >
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
      >
        {submitLabel}
      </button>
    </form>
  );
}
