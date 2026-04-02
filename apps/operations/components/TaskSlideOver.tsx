"use client";

import { useState, useEffect } from "react";
import type { Task } from "./TaskTable";

interface Contact {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
}

interface TaskSlideOverProps {
  task: Task | null;
  contacts: Contact[];
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
}

export function TaskSlideOver({ task, contacts, onSave, onClose }: TaskSlideOverProps) {
  const isEdit = !!task;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"Critical" | "High" | "Normal">("Normal");
  const [responsibleId, setResponsibleId] = useState<string>("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<string>("Open");
  const [cancelReason, setCancelReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority as "Critical" | "High" | "Normal");
      setResponsibleId(task.responsibleId || "");
      setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
      setStatus(task.status);
      setCancelReason(task.cancelReason || "");
    } else {
      setTitle("");
      setDescription("");
      setPriority("Normal");
      setResponsibleId("");
      setDueDate("");
      setStatus("Open");
      setCancelReason("");
    }
  }, [task]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title,
        description,
        priority,
        responsibleId: responsibleId || null,
        dueDate: dueDate || null,
      };

      if (isEdit) {
        payload.status = status;
        if (status === "Cancelled") {
          payload.cancelReason = cancelReason;
        }
      }

      await onSave(payload);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          placeholder="Task title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
          placeholder="Describe the task..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
        <div className="flex gap-4">
          {(["Normal", "High", "Critical"] as const).map((p) => (
            <label key={p} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="priority"
                value={p}
                checked={priority === p}
                onChange={() => setPriority(p)}
                className="text-accent focus:ring-accent"
              />
              <span className="text-sm text-slate-700">{p}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Responsible Party</label>
        <select
          value={responsibleId}
          onChange={(e) => setResponsibleId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
        >
          <option value="">-- Unassigned --</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}{c.role ? ` (${c.role})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>

      {isEdit && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="Open">Open</option>
            <option value="InProgress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      )}

      {isEdit && status === "Cancelled" && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Cancel Reason</label>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            required
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
            placeholder="Reason for cancellation..."
          />
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : isEdit ? "Update Task" : "Create Task"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
