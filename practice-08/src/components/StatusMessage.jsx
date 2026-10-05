export default function StatusMessage({ kind, children }) {
  if (!children) {
    return null;
  }

  const role = kind === "error" ? "alert" : "status";

  return (
    <p className={`status-message is-${kind}`} role={role}>
      {children}
    </p>
  );
}
