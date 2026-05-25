"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { initials, formatDate } from "@/lib/utils";
import { toggleTodo } from "@/app/actions/todos";

type Todo = {
  id: string;
  title: string;
  done: boolean;
  priority: "P1" | "P2" | "P3" | "P4";
  dueDate: Date | null;
  project: { name: string } | null;
  assignee: { name: string } | null;
};

export function TodosList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, setOptimisticTodos] = useOptimistic(todos, (state, id: string) =>
    state.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
  );
  const [, startTransition] = useTransition();

  return (
    <Card>
      <CardContent className="p-0">
        {optimisticTodos.length === 0 ? (
          <div className="p-10 text-center text-sm text-white/45">No tasks. Enjoy the quiet.</div>
        ) : (
          optimisticTodos.map((t) => (
            <div
              key={t.id}
              className="grid grid-cols-[28px_1fr_1fr_80px_120px_100px] items-center gap-3 px-5 py-3.5 border-b border-white/[0.04] hover:bg-white/[0.015] transition-colors"
            >
              <button
                onClick={() =>
                  startTransition(() => {
                    setOptimisticTodos(t.id);
                    toggleTodo(t.id, !t.done);
                  })
                }
                className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                  t.done
                    ? "bg-aether-500 border-aether-500 text-white"
                    : "border-white/[0.12] hover:border-aether-500/50"
                }`}
                aria-label="Toggle task"
              >
                {t.done && <Check className="h-3 w-3" strokeWidth={3} />}
              </button>
              <div className={`text-sm ${t.done ? "line-through text-white/35" : "text-white"}`}>{t.title}</div>
              <div className="text-xs text-white/50 truncate">{t.project?.name ?? "—"}</div>
              <Badge
                variant={t.priority === "P1" ? "destructive" : t.priority === "P2" ? "warning" : "secondary"}
                className="h-5 px-1.5 text-[10px]"
              >
                {t.priority}
              </Badge>
              <div className="text-xs text-white/55">
                {t.dueDate ? formatDate(t.dueDate, { month: "short", day: "numeric" }) : "—"}
              </div>
              <div className="flex items-center gap-2">
                {t.assignee && (
                  <>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[9px]">{initials(t.assignee.name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-[11px] text-white/55">{t.assignee.name.split(" ")[0]}</span>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
