"use client";

import { Card, message } from "antd";

import styles from "./index.module.css";

import { useCallback, useMemo, useState } from "react";

import { Assignee } from "@/app/api/models/assignee.interface";
import { Task } from '@/app/api/models/task.interface';
import { TaskHeader } from '@/app/components/task/edit/features';
import { AssigneeAdditor, AssigneeRemoval, ShowMetrics } from '@/app/components/task/view/features';
import Assignees from '@/app/components/task/view/entities/Assignees';
import EditTaskForm from '@/app/components/task/edit/entities/EditTaskForm';
import { TaskNote } from '@/app/components/task/view/shared';
import dayjs from 'dayjs';

const createEmptyTask = (): Task => ({
  id: 0,
  title: "",
  description: "",
  status: "OPEN",
  priority: "MEDIUM",
  due_date: new Date(),
  overdueDays: 0,
  hours: { fact: 0, planned: 0 },
  budget: { fact: 0, planned: 0 },
  assignees: [],
  tags: [],
  task_images: [],
  note: undefined,
  created_by: 1,
  created_at: new Date()
});

export default function TaskAdditor() {
  const [removing, setRemoving] = useState<Assignee | null>(null);
  const [adding, setAdding] = useState(false);
  const [taskToAdd, updateTaskToAdd] = useState<Task>(createEmptyTask);

  /** Последнее удаление — для отката */
    const [lastRemoved, setLastRemoved] = useState<{
      assignee: Assignee;
      index: number;
    } | null>(null);
  
    /* ---------- Обновление задачи из формы ---------- */
    const updateTask = useCallback((patch: Partial<Task>) => {
      updateTaskToAdd((prev) => ({ ...prev, ...patch }));
    }, []);
  
    /* ---------- Просрочка ---------- */
    const overdueDays = useMemo(() => {
      if (!taskToAdd.due_date) return 0;
      return Math.max(
        0,
        dayjs().startOf("day").diff(dayjs(taskToAdd.due_date).startOf("day"), "day")
      );
    }, [taskToAdd.due_date]);
  
    /* ---------- Удаление ---------- */
    const removeAssignee = (removed: Assignee) => {
      updateTaskToAdd((prev) => {
        const index = prev.assignees.findIndex((a) => a.id === removed.id);
        if (index === -1) return prev;
  
        setLastRemoved({ assignee: removed, index });
  
        return {
          ...prev,
          assignees: prev.assignees.filter((a) => a.id !== removed.id),
        };
      });
  
      setRemoving(null);
      message.success("Исполнитель удалён");
    };
  
    const undoRemove = () => {
      if (!lastRemoved) return;
  
      updateTaskToAdd((prev) => {
        const next = [...prev.assignees];
        next.splice(lastRemoved.index, 0, lastRemoved.assignee);
        return { ...prev, assignees: next };
      });
  
      setLastRemoved(null);
      message.info("Удаление отменено");
    };
  
    /* ---------- Добавление ---------- */
    const addAssignee = (assignee: Assignee) => {
      // Защита от дубликатов по id
      updateTaskToAdd((prev) => {
        const exists = prev.assignees.some((a) => a.id === assignee.id);
        if (exists) return prev;
  
        return { ...prev, assignees: [...prev.assignees, assignee] };
      });
  
      setAdding(false);
      message.success("Исполнитель добавлен");
    };
  return (
    <>
      <TaskHeader task={taskToAdd} />
      <div className={styles.grid}>
        <EditTaskForm task={taskToAdd} updateTask={updateTaskToAdd}/>
        <div className={styles.right}>
          <Card className={styles.card}>
            <ShowMetrics
              due_date={taskToAdd.due_date.toLocaleDateString("ru-RU")}
              overdueDays={taskToAdd.overdueDays /**TODO: посчитать на фронтенде */}
              actualBudget={taskToAdd.budget.fact}
              estimatedBudget={taskToAdd.budget.planned}
              actualHours={taskToAdd.hours.fact}
              estimatedHours={taskToAdd.hours.planned}
            />
          </Card>
          <Card className={styles.card}>
            <Assignees
              assignees={taskToAdd.assignees}
              undoRemove={(assignee: Assignee) => undoRemove()}
              showAssigneeAddModal={() => setAdding(true)}
              showAssigneeRemoveModal={setRemoving}
            />
          </Card>
          {taskToAdd.note && <TaskNote note={taskToAdd.note} />}
        </div>
      </div>
      <AssigneeAdditor
        isOpen={adding}
        onClose={() => setAdding(false)}
        save={addAssignee}
      />

      {removing && (
        <AssigneeRemoval
          assignee={removing}
          onClose={() => setRemoving(null)}
          isOpen={!!removing}
          onRemove={removeAssignee}
        />
      )}
    </>
  );
}
