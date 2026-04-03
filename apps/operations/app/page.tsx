"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { TASK_PRIORITY_ORDER, FirstVisitHint, MetricCardSkeleton, TableRowSkeleton } from "@rescue-ops/shared";
import { Header } from "@components/Header";
import { StatsRow } from "@components/StatsRow";
import { FilterBar } from "@components/FilterBar";
import { TaskTable, type Task } from "@components/TaskTable";
import { SlideOver } from "@components/SlideOver";
import { TaskSlideOver } from "@components/TaskSlideOver";
import { WorkOrderPDF } from "@components/WorkOrderPDF";
import { printPdf } from "../lib/printPdf";

interface Contact {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
}

const ORG_NAME = "Mpumalanga Steel Fabricators (Pty) Ltd";

export default function OperationsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Slide-over state
  const [slideOpen, setSlideOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [tasksRes, contactsRes] = await Promise.all([
        fetch("/api/tasks?limit=200"),
        fetch("/api/contacts"),
      ]);
      const tasksData = await tasksRes.json();
      const contactsData = await contactsRes.json();
      setTasks(tasksData.data || []);
      setContacts(contactsData || []);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Client-side filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter && t.status !== statusFilter) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !t.title.toLowerCase().includes(q) &&
          !t.description.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, searchQuery]);

  // Stats computed from ALL tasks (not filtered)
  const stats = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      openCount: tasks.filter((t) => t.status === "Open").length,
      criticalCount: tasks.filter(
        (t) => t.priority === "Critical" && (t.status === "Open" || t.status === "InProgress")
      ).length,
      inProgressCount: tasks.filter((t) => t.status === "InProgress").length,
      completedThisWeek: tasks.filter(
        (t) => t.completedAt && new Date(t.completedAt) >= oneWeekAgo
      ).length,
    };
  }, [tasks]);

  function handleNewTask() {
    setEditingTask(null);
    setSlideOpen(true);
  }

  function handleEdit(task: Task) {
    setEditingTask(task);
    setSlideOpen(true);
  }

  async function handlePrint(task: Task) {
    await printPdf(
      <WorkOrderPDF task={task} orgName={ORG_NAME} />
    );
  }

  async function handleSave(data: Record<string, unknown>) {
    if (editingTask) {
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to update task");
        return;
      }
    } else {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to create task");
        return;
      }
    }

    setSlideOpen(false);
    setEditingTask(null);
    setLoading(true);
    await fetchData();
  }

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-7 w-48 bg-slate-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <Header onNewTask={handleNewTask} />

      <StatsRow
        openCount={stats.openCount}
        criticalCount={stats.criticalCount}
        inProgressCount={stats.inProgressCount}
        completedThisWeek={stats.completedThisWeek}
      />

      <FilterBar
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        searchQuery={searchQuery}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
        onSearchChange={setSearchQuery}
      />

      <TaskTable
        tasks={filteredTasks}
        onEdit={handleEdit}
        onPrint={handlePrint}
        hasFilters={!!(statusFilter || priorityFilter || searchQuery)}
        onClearFilters={() => { setStatusFilter(""); setPriorityFilter(""); setSearchQuery(""); }}
      />

      <SlideOver
        open={slideOpen}
        onClose={() => { setSlideOpen(false); setEditingTask(null); }}
        title={editingTask ? "Edit Task" : "New Task"}
      >
        <TaskSlideOver
          task={editingTask}
          contacts={contacts}
          onSave={handleSave}
          onClose={() => { setSlideOpen(false); setEditingTask(null); }}
        />
      </SlideOver>

      {/* Mobile FAB */}
      <div className="fixed bottom-20 right-4 z-40 md:hidden relative">
        <button
          onClick={() => setSlideOpen(true)}
          className="w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center animate-scale-in active:scale-95 transition-transform"
          aria-label="New Task"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <FirstVisitHint
          storageKey="rescue-ops-ops-hints-seen"
          message="Tap + to create your first task"
          position="top"
        />
      </div>
    </main>
  );
}
