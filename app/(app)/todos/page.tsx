import { ListChecks } from "lucide-react";
import { ModuleShell } from "@/components/app/module-shell";
import { EmptyState } from "@/components/app/empty-state";
import { TodosList } from "@/components/modules/todos-list";
import { listTodos } from "@/lib/data/todos";

export default async function TodosPage() {
  const todos = await listTodos();

  const exportRows = todos.map((t) => ({
    title: t.title,
    project: t.project?.name ?? "",
    assignee: t.assignee?.name ?? "",
    priority: t.priority,
    done: t.done ? "yes" : "no",
    due_date: t.dueDate ? t.dueDate.toISOString().slice(0, 10) : "",
    created_at: t.createdAt.toISOString(),
  }));

  return (
    <ModuleShell
      eyebrow="To Dos"
      title="Tasks"
      description="Assignments, reminders, priorities. Linked to projects, tickets, opportunities."
      exportConfig={{
        filenamePrefix: "tasks",
        rows: exportRows,
        columns: [
          { key: "title", header: "Title" },
          { key: "project", header: "Project" },
          { key: "assignee", header: "Assignee" },
          { key: "priority", header: "Priority" },
          { key: "done", header: "Done" },
          { key: "due_date", header: "Due" },
          { key: "created_at", header: "Created" },
        ],
      }}
    >
      {todos.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No tasks yet"
          description="Spin up a task to keep track of what your team needs to do — project follow-ups, vendor calls, install prep."
          cta="Create your first task"
          ctaKind="todo"
        />
      ) : (
        <TodosList todos={todos} />
      )}
    </ModuleShell>
  );
}
