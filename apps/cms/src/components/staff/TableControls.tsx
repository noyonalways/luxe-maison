import { useState, useMemo, useCallback } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- Sorting hook ---
export type SortDir = 'asc' | 'desc';

export function useTableSort<T>(defaultField: keyof T, defaultDir: SortDir = 'asc') {
  const [sortField, setSortField] = useState<keyof T>(defaultField);
  const [sortDir, setSortDir] = useState<SortDir>(defaultDir);

  const handleSort = useCallback((field: keyof T) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }, [sortField]);

  const sortData = useCallback((data: T[]) => {
    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      let cmp = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        // Try date parse
        const aDate = Date.parse(aVal);
        const bDate = Date.parse(bVal);
        if (!isNaN(aDate) && !isNaN(bDate)) cmp = aDate - bDate;
        else cmp = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [sortField, sortDir]);

  return { sortField, sortDir, handleSort, sortData };
}

// --- Sortable header component ---
export function SortableHeader<T>({
  field, label, sortField, sortDir, onSort, className = '',
}: {
  field: keyof T;
  label: string;
  sortField: keyof T;
  sortDir: SortDir;
  onSort: (field: keyof T) => void;
  className?: string;
}) {
  const active = sortField === field;
  return (
    <button onClick={() => onSort(field)} className={`flex items-center gap-1 hover:text-foreground transition-colors ${className}`}>
      {label}
      {active ? (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="opacity-40" />}
    </button>
  );
}

// --- Pagination hook ---
export function useTablePagination(totalItems: number, defaultPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(defaultPerPage);

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginateData = useCallback(<T,>(data: T[]): T[] => {
    const start = (safeCurrentPage - 1) * perPage;
    return data.slice(start, start + perPage);
  }, [safeCurrentPage, perPage]);

  const resetPage = useCallback(() => setCurrentPage(1), []);

  return { currentPage: safeCurrentPage, perPage, totalPages, setCurrentPage, setPerPage, paginateData, resetPage };
}

// --- Pagination controls component ---
export function PaginationControls({
  currentPage, totalPages, perPage, totalItems, setCurrentPage, setPerPage, perPageOptions = [5, 10, 20, 50],
}: {
  currentPage: number;
  totalPages: number;
  perPage: number;
  totalItems: number;
  setCurrentPage: (p: number) => void;
  setPerPage: (p: number) => void;
  perPageOptions?: number[];
}) {
  if (totalItems === 0) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
    .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 px-1">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Rows:</span>
        <select
          value={perPage}
          onChange={e => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
          className="h-8 rounded border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {perPageOptions.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <span className="ml-1">
          {((currentPage - 1) * perPage) + 1}–{Math.min(currentPage * perPage, totalItems)} of {totalItems}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
          <ChevronLeft size={14} />
        </Button>
        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`e-${i}`} className="px-1 text-muted-foreground">…</span>
          ) : (
            <Button key={p} variant={currentPage === p ? 'default' : 'outline'} size="icon" className="h-8 w-8 text-xs" onClick={() => setCurrentPage(p)}>
              {p}
            </Button>
          )
        )}
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}
