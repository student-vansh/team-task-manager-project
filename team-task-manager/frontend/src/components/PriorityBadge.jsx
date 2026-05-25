const styles = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-red-100 text-red-700",
};

export default function PriorityBadge({ priority }) {
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${styles[priority] || "bg-slate-100 text-slate-600"}`}
    >
      {priority}
    </span>
  );
}
