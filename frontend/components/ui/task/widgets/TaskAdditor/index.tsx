"use client";

import { Card, message } from "antd";

import styles from "./index.module.css";

import { useCallback, useMemo, useState } from "react";


import { createTaskReq } from "@/api/requests";
import { Assignee } from "@/entities/assignee.interface";
import { Task } from "@/entities/task.interface";
import { TaskWithoutCreatedBy } from "@/utils/types";
import dayjs from 'dayjs';
import AddAssigneeForm from "../../../assignees/features/AddAssigneeForm";
import AssigneeRemoval from "../../../assignees/features/RemoveAssigneeModal";
import TaskAssigneesWidget from "../../../assignees/widgets/TaskAssigneesWidget";
import { TaskNote } from "../../../shared";
import ShowMetrics from "../../entities/ShowMetrics";
import TaskHeader from "../../entities/TaskHeader";
import EditTaskForm from "../../features/EditTaskForm";

const createEmptyTask = (): TaskWithoutCreatedBy => ({
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
  created_at: new Date()
});

export default function TaskAdditor() {
  const [removing, setRemoving] = useState<Assignee | null>(null);
  const [adding, setAdding] = useState(false);
  const [taskToAdd, updateTaskToAdd] = useState<TaskWithoutCreatedBy>(createEmptyTask);

  /** Последнее удаление — для отката */
    const [lastRemoved, setLastRemoved] = useState<{
      assignee: Assignee;
      index: number;
    } | null>(null);
  
    /* ---------- Обновление задачи из формы ---------- */
    const updateTask = useCallback(async (patch: Omit<Task, 'created_by'>) => {
      updateTaskToAdd((prev) => ({ ...prev, ...patch }));
      const assignees = patch.assignees.map((assignee) => {
        return { ...assignee, actual_hours: assignee.hours, estimated_hours: assignee.planned }
      })
      await createTaskReq({...patch, 
        ...{assignees: assignees}});
    }, []);
  

  
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
      if (!taskToAdd.due_date) return 0;
  
      // Если задача выполнена — просрочки нет
      const doneStatuses = ["DONE", "CLOSED", "COMPLETED"];
      if (doneStatuses.includes(taskToAdd.status)) return 0;
  
      const today = dayjs().startOf("day");
      const dueDate = dayjs(taskToAdd.due_date).startOf("day");
  
      // Если дедлайн в будущем или сегодня — просрочки нет
      if (!dueDate.isBefore(today)) return 0;
  
      return today.diff(dueDate, "day");
    }, [taskToAdd.due_date, taskToAdd.status]);
  
  return (
    <>
      <TaskHeader task={taskToAdd} />
      <div className={styles.grid}>
        <EditTaskForm task={taskToAdd} updateTask={updateTaskToAdd} saveTask={updateTask}/>
        <div className={styles.right}>
          <Card title={"Эталонные значения для планирования"} className={styles.card}>
            <ShowMetrics
              due_date={taskToAdd.due_date?.toLocaleDateString("ru-RU")}
              overdueDays={overdueDays /**TODO: посчитать на фронтенде */}
              actualBudget={taskToAdd.budget.fact || 0}
              estimatedBudget={taskToAdd.budget.planned || 0}
              actualHours={taskToAdd.hours.fact || 0}
              estimatedHours={taskToAdd.hours.planned || 0}
            />
          </Card>
          <Card className={styles.card} title={"Запланированные значения"}>
            <ShowMetrics
              due_date={taskToAdd.due_date?.toLocaleDateString("ru-RU")}
              overdueDays={overdueDays /**TODO: посчитать на фронтенде */}
              actualBudget={taskToAdd.assignees.reduce((prev, cur) => prev + computeActualBudget(cur), 0)}
              estimatedBudget={taskToAdd.assignees.reduce((prev, cur) => prev + computeEstimatedBudget(cur), 0)}
              actualHours={taskToAdd.assignees.reduce((prev, cur) => prev + computeActualHours(cur), 0)}
              estimatedHours={taskToAdd.assignees.reduce((prev, cur) => prev + computeEstimatedHours(cur), 0)}
            />
            <TaskAssigneesWidget
              assignees={taskToAdd.assignees}
              undoRemove={(assignee: Assignee) => undoRemove()}
              showAssigneeAddModal={() => setAdding(true)}
              showAssigneeRemoveModal={setRemoving}
            />
          </Card>
          {taskToAdd.note && <TaskNote note={taskToAdd.note} />}
        </div>
      </div>
      <AddAssigneeForm
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
