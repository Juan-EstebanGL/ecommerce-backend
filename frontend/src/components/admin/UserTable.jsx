import UserRoleBadge from "./UserRoleBadge";

export default function UserTable({ users, onView, onRoleToggle, onDelete, deletingId, roleLoadingId }) {
  if (!users.length) {
    return (
      <div className="ad-users-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
        <p>No hay usuarios registrados</p>
      </div>
    );
  }

  return (
    <div className="ad-users-table-wrapper">
      <table className="ad-users-table">
        <thead>
          <tr>
            <th>Avatar</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Fecha de registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isDeleting = deletingId === user.id;
            const isRoleLoading = roleLoadingId === user.id;

            return (
              <tr key={user.id} className={isDeleting ? "ad-delete--fade-out" : ""}>
                <td>
                  <div className="ad-user-avatar">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt=""
                        className="ad-user-avatar__img"
                        onError={(e) => { e.target.style.display = "none"; e.target.nextElementSibling.style.display = "flex"; }}
                      />
                    ) : null}
                    <span
                      className="ad-user-avatar__fallback"
                      style={user.avatarUrl ? { display: "none" } : undefined}
                    >
                      {(user.email?.charAt(0) || "?").toUpperCase()}
                    </span>
                  </div>
                </td>
                <td className="ad-users-cell-name">{user.name || user.email.split("@")[0]}</td>
                <td className="ad-users-cell-email">{user.email}</td>
                <td><UserRoleBadge role={user.role} /></td>
                <td className="ad-users-cell-date">
                  {new Date(user.createdAt).toLocaleDateString("es-CL", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td>
                  <div className="ad-users-actions">
                    <button
                      className="ad-users-btn ad-users-btn--view"
                      title="Ver usuario"
                      onClick={() => onView(user)}
                      disabled={isDeleting}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button
                      className="ad-users-btn ad-users-btn--role"
                      title={user.role === "ADMIN" ? "Degradar a USER" : "Promocionar a ADMIN"}
                      onClick={() => onRoleToggle(user)}
                      disabled={isDeleting || isRoleLoading}
                    >
                      {isRoleLoading ? (
                        <span className="ad-delete__spinner" style={{ borderTopColor: "#b45309", borderColor: "rgba(245,158,11,0.25)" }} />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      )}
                    </button>
                    <button
                      className="ad-users-btn ad-users-btn--delete"
                      title="Eliminar usuario"
                      onClick={() => onDelete(user.id)}
                      disabled={isDeleting || isRoleLoading}
                    >
                      {isDeleting ? (
                        <span className="ad-delete__spinner" />
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
