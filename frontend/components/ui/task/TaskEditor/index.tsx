"use client";



import { Card, message } from "antd";

import styles from "./index.module.css";

import { useCallback, useMemo, useState } from "react";


import { Assignee } from "@/entities/assignee.interface";
import { Task } from "@/entities/task.interface";
import dayjs from 'dayjs';
import { TaskNote } from "../../shared";
import AssigneeAdditor from "../AssigneeAdditor";
import AssigneeRemoval from "../AssigneeRemoval";
import Assignees from "../Assignees";
import EditTaskForm from "../EditTaskForm";
import ShowMetrics from "../ShowMetrics";
import TaskHeader from "../TaskHeader";

export default function TaskEditor({ task }: { task: Task }) {
  const [removing, setRemoving] = useState<Assignee | null>(null);
  const [adding, setAdding] = useState(false);

  const [editedTask, updateEditedTask]  = useState<Task>(task);

  /** Последнее удаление — для отката */
  const [lastRemoved, setLastRemoved] = useState<{
    assignee: Assignee;
    index: number;
  } | null>(null);

  /* ---------- Обновление задачи из формы ---------- */
  const updateTask = useCallback((patch: Partial<Task>) => {
    updateEditedTask((prev) => ({ ...prev, ...patch }));
  }, []);


  /* ---------- Удаление ---------- */
  const removeAssignee = (removed: Assignee) => {
    updateEditedTask((prev) => {
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

    updateEditedTask((prev) => {
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
    updateEditedTask((prev) => {
      const exists = prev.assignees.some((a) => a.id === assignee.id);
      if (exists) return prev;

      return { ...prev, assignees: [...prev.assignees, assignee] };
    });

    setAdding(false);
    message.success("Исполнитель добавлен");
  };

  const computeActualBudget = (assignee: Assignee) => {
    return assignee.hourly_rate ? assignee.hourly_rate * assignee.hours: 0;
  }

  const computeEstimatedBudget = (assignee: Assignee) => {
    return assignee.hourly_rate ? assignee.hourly_rate * assignee.planned: 0;
  }

  const computeActualHours = (assignee: Assignee) => {
    return assignee.hours;
  }

  const computeEstimatedHours = (assignee: Assignee) => {
    return assignee.planned;
  }

   /* ---------- Просрочка ---------- */
  /**
   * Вычисление количества дней просрочки.
   * Просрочка не считается, если:
   *  - нет даты дедлайна;
   *  - задача выполнена (статус DONE / CLOSED — подставьте свои значения).
   * Возвращает целое число дней просрочки (0, если не просрочено).
   */
  const overdueDays = useMemo(() => {
    if (!editedTask.due_date) return 0;

    // Если задача выполнена — просрочки нет
    const doneStatuses = ["DONE", "CLOSED", "COMPLETED"];
    if (doneStatuses.includes(editedTask.status)) return 0;

    const today = dayjs().startOf("day");
    const dueDate = dayjs(editedTask.due_date).startOf("day");

    // Если дедлайн в будущем или сегодня — просрочки нет
    if (!dueDate.isBefore(today)) return 0;

    return today.diff(dueDate, "day");
  }, [editedTask.due_date, editedTask.status]);


  return (
    <>
      <TaskHeader task={editedTask} />
      <div className={styles.grid}>
        <EditTaskForm task={editedTask} updateTask={updateEditedTask}/>
        <div className={styles.right}>
          <Card title={"Эталонные значения для планирования"} className={styles.card}>
            
            <ShowMetrics
              due_date={editedTask.due_date?.toLocaleDateString("ru-RU")}
              overdueDays={overdueDays /**TODO: посчитать на фронтенде */}
              actualBudget={editedTask.budget.fact}
              estimatedBudget={editedTask.budget.planned}
              actualHours={editedTask.hours.fact}
              estimatedHours={editedTask.hours.planned}
            />
          </Card>
          <Card className={styles.card} title={"Запланированные значения"}>
            <ShowMetrics
              due_date={editedTask.due_date?.toLocaleDateString("ru-RU")}
              overdueDays={overdueDays /**TODO: посчитать на фронтенде */}
              actualBudget={editedTask.assignees.reduce((prev, cur) => prev + computeActualBudget(cur), 0)}
              estimatedBudget={editedTask.assignees.reduce((prev, cur) => prev + computeEstimatedBudget(cur), 0)}
              actualHours={editedTask.assignees.reduce((prev, cur) => prev + computeActualHours(cur), 0)}
              estimatedHours={editedTask.assignees.reduce((prev, cur) => prev + computeEstimatedHours(cur), 0)}
            />
            <Assignees
              assignees={editedTask.assignees}
              undoRemove={(assignee) => undoRemove()}
              showAssigneeAddModal={() => setAdding(true)}
              showAssigneeRemoveModal={setRemoving}
            />
          </Card>
          {editedTask.note && <TaskNote note={editedTask.note} />}
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

