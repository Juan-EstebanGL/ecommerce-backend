function getPageNumbers(current, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [];

  pages.push(1);

  if (current > 3) {
    pages.push("...");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < totalPages - 2) {
    pages.push("...");
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

export default function Pagination({ page, totalPages, total, itemsPerPage, onPageChange }) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * itemsPerPage + 1;
  const to = Math.min(page * itemsPerPage, total);
  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="pgn">
      <p className="pgn__info">
        Mostrando {from}–{to} de {total} {total === 1 ? "elemento" : "elementos"}
      </p>
      <div className="pgn__controls">
        <button
          className="pgn__btn pgn__nav"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Anterior
        </button>

        <div className="pgn__numbers">
          {pages.map((p, i) =>
            p === "..." ? (
              <span key={`e${i}`} className="pgn__ellipsis">...</span>
            ) : (
              <button
                key={p}
                className={`pgn__num${p === page ? " pgn__num--active" : ""}`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          className="pgn__btn pgn__nav"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
