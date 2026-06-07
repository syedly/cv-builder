'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;        // 0-indexed
  totalPages: number;
  total: number;
  perPage: number;
  onPage: (p: number) => void;
}

export function Pagination({ page, totalPages, total, perPage, onPage }: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = page * perPage + 1;
  const to = Math.min((page + 1) * perPage, total);

  // Build page number list with ellipsis
  const pages: (number | '…')[] = [];
  if (totalPages <= 7) {
    for (let i = 0; i < totalPages; i++) pages.push(i);
  } else {
    pages.push(0);
    if (page > 2) pages.push('…');
    for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) pages.push(i);
    if (page < totalPages - 3) pages.push('…');
    pages.push(totalPages - 1);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Showing <span className="font-medium text-slate-700 dark:text-slate-300">{from}–{to}</span> of{' '}
        <span className="font-medium text-slate-700 dark:text-slate-300">{total}</span> results
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => onPage(page - 1)}
          className="page-btn"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p as number)}
              className={p === page ? 'page-btn-active' : 'page-btn'}
            >
              {(p as number) + 1}
            </button>
          )
        )}

        <button
          type="button"
          disabled={page >= totalPages - 1}
          onClick={() => onPage(page + 1)}
          className="page-btn"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface PerPageSelectorProps {
  perPage: number;
  onChange: (n: number) => void;
  options?: number[];
  total: number;
}

export function PerPageSelector({ perPage, onChange, options = [5, 10, 25, 50], total }: PerPageSelectorProps) {
  if (total === 0) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">Show</span>
      <select
        value={perPage}
        onChange={e => onChange(Number(e.target.value))}
        className="px-2.5 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl
                   bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200
                   focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
                   transition-colors cursor-pointer"
      >
        {options.map(n => (
          <option key={n} value={n}>{n} per page</option>
        ))}
      </select>
    </div>
  );
}
