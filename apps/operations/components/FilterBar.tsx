interface FilterBarProps {
  statusFilter: string;
  priorityFilter: string;
  searchQuery: string;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
  onSearchChange: (query: string) => void;
}

export function FilterBar({
  statusFilter,
  priorityFilter,
  searchQuery,
  onStatusChange,
  onPriorityChange,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-3 md:gap-4 mb-6">
      <input
        type="text"
        placeholder="Search tasks..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full md:flex-1 md:min-w-[200px] px-3 py-2.5 min-h-[44px] border border-gray-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 md:order-last"
      />
      <div className="grid grid-cols-2 md:flex gap-3 md:gap-4">
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2.5 min-h-[44px] border border-gray-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="InProgress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="px-3 py-2.5 min-h-[44px] border border-gray-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          <option value="">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Normal">Normal</option>
        </select>
      </div>
    </div>
  );
}
