interface PaginationProps {
  page: number;
  totalPages: number;
  totalElements?: number;
  onPageChange: (newPage: number) => void;
  entityName?: string;
}

export default function Pagination({
  page,
  totalPages,
  totalElements,
  onPageChange,
  entityName = 'items',
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages || 1);

  return (
    <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4 text-xs text-gray-500">
      <span>
        Page {page + 1} of {safeTotalPages}
        {totalElements !== undefined ? ` (${totalElements} ${entityName})` : ''}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= safeTotalPages - 1}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}

