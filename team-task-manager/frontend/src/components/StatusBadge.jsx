const styles = {
  "To Do": "bg-slate-100 text-slate-700",
  "In Progress": "bg-amber-100 text-amber-800",
  Done: "bg-emerald-100 text-emerald-800",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-slate-100 text-slate-600"}`}
    >
      {status}
    </span>
  );
}
