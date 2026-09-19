'use client';

import React, { useState } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download,
  Filter,
  Trash2,
  Eye,
  CheckSquare,
  Square,
} from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchKey?: (item: T) => string;
  filterOptions?: { label: string; value: string; filterFn: (item: T) => boolean }[];
  bulkActions?: {
    label: string;
    action: (selectedIds: string[]) => void;
    isDestructive?: boolean;
  }[];
  idKey?: keyof T;
  emptyTitle?: string;
  emptySubtitle?: string;
  pageSize?: number;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  searchPlaceholder = 'Search...',
  searchKey,
  filterOptions,
  bulkActions,
  idKey = 'id' as keyof T,
  emptyTitle = 'No records found',
  emptySubtitle = 'Try adjusting your filters or search term.',
  pageSize = 10,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filtering
  let filtered = [...data];
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((item) => {
      if (searchKey) return searchKey(item).toLowerCase().includes(q);
      return Object.values(item).some(
        (val) => typeof val === 'string' && val.toLowerCase().includes(q)
      );
    });
  }

  if (activeFilter !== 'all' && filterOptions) {
    const opt = filterOptions.find((f) => f.value === activeFilter);
    if (opt) filtered = filtered.filter(opt.filterFn);
  }

  // Sorting
  if (sortKey) {
    filtered.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
  }

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Bulk Selection
  const allCurrentSelected =
    paginated.length > 0 && paginated.every((item) => selectedIds.includes(String(item[idKey])));

  const toggleSelectAll = () => {
    if (allCurrentSelected) {
      const currentIds = paginated.map((item) => String(item[idKey]));
      setSelectedIds(selectedIds.filter((id) => !currentIds.includes(id)));
    } else {
      const currentIds = paginated.map((item) => String(item[idKey]));
      setSelectedIds(Array.from(new Set([...selectedIds, ...currentIds])));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleExportCSV = () => {
    const headers = columns.map((c) => c.header).join(',');
    const rows = filtered.map((item) =>
      columns.map((c) => `"${String(item[c.key] || '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3.5 select-none">
      {/* Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#161822] p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 bg-[#10121A] border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto justify-between sm:justify-end">
          {filterOptions && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setActiveFilter('all');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeFilter === 'all'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                All
              </button>
              {filterOptions.map((f) => (
                <button
                  key={f.value}
                  onClick={() => {
                    setActiveFilter(f.value);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeFilter === f.value
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#10121A] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-lg text-xs font-semibold transition-all shrink-0"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Bulk Actions Banner */}
      {selectedIds.length > 0 && bulkActions && (
        <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs animate-in fade-in">
          <span className="text-rose-300 font-bold">
            {selectedIds.length} item(s) selected
          </span>
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {bulkActions.map((b) => (
              <button
                key={b.label}
                onClick={() => {
                  b.action(selectedIds);
                  setSelectedIds([]);
                }}
                className={`px-3 py-1 rounded-lg font-bold text-xs shadow-xs transition-all ${
                  b.isDestructive
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#161822] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#10121A] text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
              <tr>
                {bulkActions && (
                  <th className="p-3 w-8">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white">
                      {allCurrentSelected ? (
                        <CheckSquare className="w-4 h-4 text-rose-500" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => {
                      if (col.sortable) {
                        if (sortKey === col.key) {
                          setSortAsc(!sortAsc);
                        } else {
                          setSortKey(col.key);
                          setSortAsc(true);
                        }
                      }
                    }}
                    className={`p-3 ${col.sortable ? 'cursor-pointer hover:text-white' : ''}`}
                  >
                    <div className="flex items-center gap-1">
                      <span>{col.header}</span>
                      {col.sortable && <ArrowUpDown className="w-3 h-3 text-slate-500" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                Array.from({ length: Math.min(pageSize, 6) }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    {bulkActions && (
                      <td className="p-3 w-8">
                        <div className="w-4 h-4 bg-slate-800/80 rounded" />
                      </td>
                    )}
                    {columns.map((col, cIdx) => (
                      <td key={col.key || cIdx} className="p-3">
                        <div
                          className={`h-4 bg-slate-800/80 rounded ${
                            cIdx === 0 ? "w-36" : cIdx === 1 ? "w-24" : "w-16"
                          }`}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginated.length > 0 ? (
                paginated.map((item, idx) => {
                  const id = String(item[idKey] || idx);
                  const isSelected = selectedIds.includes(id);
                  return (
                    <tr
                      key={id}
                      className={`hover:bg-slate-800/30 transition-colors ${
                        isSelected ? 'bg-rose-950/15' : ''
                      }`}
                    >
                      {bulkActions && (
                        <td className="p-3 w-8">
                          <button
                            onClick={() => toggleSelectOne(id)}
                            className="text-slate-400 hover:text-white"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-rose-500" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      )}
                      {columns.map((col) => (
                        <td key={col.key} className="p-3">
                          {col.render ? col.render(item) : String(item[col.key] ?? '')}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + (bulkActions ? 1 : 0)}
                    className="p-10 text-center text-slate-400"
                  >
                    <div className="font-bold text-white text-sm">{emptyTitle}</div>
                    <div className="text-xs text-slate-500 mt-1">{emptySubtitle}</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filtered.length > pageSize && (
          <div className="p-3 bg-[#10121A] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="text-center sm:text-left">
              Showing <strong className="text-white">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong className="text-white">
                {Math.min(currentPage * pageSize, filtered.length)}
              </strong>{' '}
              of <strong className="text-white">{filtered.length}</strong> entries
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-bold text-white">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
