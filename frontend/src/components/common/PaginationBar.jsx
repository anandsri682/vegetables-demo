import React from 'react';

export default function PaginationBar({ currentPage, totalItems, pageSize = 10, onPageChange }) {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '12px 0' }}>
      <small className="muted">Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries</small>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          className="btn-outline-sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
        >
          &larr; Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              border: p === currentPage ? 'none' : '1px solid #cbd5e1',
              background: p === currentPage ? '#059669' : '#fff',
              color: p === currentPage ? '#fff' : '#475569',
              fontWeight: p === currentPage ? 700 : 500,
              cursor: 'pointer'
            }}
          >
            {p}
          </button>
        ))}
        <button
          className="btn-outline-sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
}
