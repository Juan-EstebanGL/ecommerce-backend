export default function UserRoleBadge({ role }) {
  let label, className;

  if (role === "ADMIN") {
    label = "ADMIN";
    className = "ad-users-badge ad-users-badge--admin";
  } else {
    label = "USER";
    className = "ad-users-badge ad-users-badge--user";
  }

  return <span className={className}>{label}</span>;
}
