import { TASK_PRIORITY_ORDER } from "@rescue-ops/shared";

interface Task {
  id: string;
  taskNumber: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  responsibleId: string | null;
  dueDate: string | null;
  completedAt: string | null;
  cancelReason: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  responsible: { id: string; name: string } | null;
}

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onPrint: (task: Task) => void;
}

function priorityBadge(priority: string) {
  switch (priority) {
    case "Critical":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">Critical</span>;
    case "High":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">High</span>;
    default:
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">Normal</span>;
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "Open":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Open</span>;
    case "InProgress":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">In Progress</span>;
    case "Completed":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Completed</span>;
    case "Cancelled":
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Cancelled</span>;
    default:
      return <span className="text-xs">{status}</span>;
  }
}

function isOverdue(task: Task): boolean {
  if (!task.dueDate) return false;
  if (task.status === "Completed" || task.status === "Cancelled") return false;
  return new Date(task.dueDate) < new Date();
}

function formatTaskNumber(num: number): string {
  return `OT-${String(num).padStart(4, "0")}`;
}

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const pa = TASK_PRIORITY_ORDER[a.priority] ?? 2;
    const pb = TASK_PRIORITY_ORDER[b.priority] ?? 2;
    if (pa !== pb) return pa - pb;

    const aOverdue = isOverdue(a) ? 0 : 1;
    const bOverdue = isOverdue(b) ? 0 : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;

    const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    return aDate - bDate;
  });
}

export function TaskTable({ tasks, onEdit, onPrint }: TaskTableProps) {
  const sorted = sortTasks(tasks);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-500">#</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Title</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Priority</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Responsible</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Due Date</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  No tasks found
                </td>
              </tr>
            ) : (
              sorted.map((task) => {
                const overdue = isOverdue(task);
                return (
                  <tr key={task.id} className="border-b last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {formatTaskNumber(task.taskNumber)}
                    </td>
                    <td className="px-4 py-3 text-slate-900 font-medium max-w-[250px] truncate">
                      {task.title}
                    </td>
                    <td className="px-4 py-3">{priorityBadge(task.priority)}</td>
                    <td className="px-4 py-3">{statusBadge(task.status)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {task.responsible?.name || <span className="text-slate-300">&mdash;</span>}
                    </td>
                    <td className={`px-4 py-3 ${overdue ? "text-red-600 font-medium" : "text-slate-600"}`}>
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString("en-ZA")
                        : <span className="text-slate-300">&mdash;</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onPrint(task)}
                          className="text-slate-400 hover:text-accent transition-colors"
                          title="Print Work Order"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onEdit(task)}
                          className="text-slate-400 hover:text-accent transition-colors"
                          title="Edit Task"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export type { Task };
