import { useState, useEffect, useRef } from 'react';

interface InfiniteSelectProps<T> {
  fetchPage: (search: string, page: number) => Promise<{ items: T[]; hasMore: boolean }>;
  value: T | null;
  onChange: (item: T | null) => void;
  getLabel: (item: T) => string;
  getKey: (item: T) => string | number;
  placeholder?: string;
}

export default function InfiniteSelect<T>({
  fetchPage,
  value,
  onChange,
  getLabel,
  getKey,
  placeholder = 'Search...',
}: InfiniteSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef(search);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    searchRef.current = val;
  };

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetchPage(search, 0);
        if (!cancelled) {
          setItems(res.items);
          setHasMore(res.hasMore);
          setPage(0);
        }
      } catch {
        // ignore
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [open, search, fetchPage]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const onScroll = async () => {
    const el = listRef.current;
    if (!el || loading || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      setLoading(true);
      try {
        const nextPage = page + 1;
        const res = await fetchPage(searchRef.current, nextPage);
        setItems((prev) => [...prev, ...res.items]);
        setHasMore(res.hasMore);
        setPage(nextPage);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 bg-white text-sm text-gray-800 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value ? getLabel(value) : placeholder}
        </span>
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={placeholder}
              className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div
            ref={listRef}
            onScroll={onScroll}
            className="max-h-48 overflow-y-auto"
          >
            {items.map((item) => (
              <button
                key={getKey(item)}
                type="button"
                onClick={() => {
                  onChange(item);
                  setOpen(false);
                  setSearch('');
                  searchRef.current = '';
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  value && getKey(value) === getKey(item) ? 'bg-blue-50 text-blue-700' : 'text-gray-800'
                }`}
              >
                {getLabel(item)}
              </button>
            ))}
            {loading && (
              <p className="text-center text-xs text-gray-400 py-2">Loading…</p>
            )}
            {!loading && items.length === 0 && (
              <p className="text-center text-xs text-gray-400 py-3">No results</p>
            )}
            {!loading && hasMore && items.length > 0 && (
              <p className="text-center text-xs text-gray-400 py-1">Scroll for more</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
