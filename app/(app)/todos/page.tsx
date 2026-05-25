import { ListChecks } from "lucide-react";
import { ModuleShell } from "@/components/app/module-shell";
import { EmptyState } from "@/components/app/empty-state";
import { TodosList } from "@/components/modules/todos-list";
import { listTodos } from "@/lib/data/todos";

export default async function TodosPage() {
  const todos = await listTodos();

  return (
    <ModuleShell
      eyebrow="To Dos"
      title="Tasks"
      description="Assignments, reminders, priorities. Linked to projects, tickets, opportunities."
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
