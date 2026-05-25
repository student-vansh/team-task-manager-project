export function getId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id?.toString() || value.toString();
}

export function isProjectAdmin(project, userId) {
  return getId(project?.admin) === getId(userId);
}
