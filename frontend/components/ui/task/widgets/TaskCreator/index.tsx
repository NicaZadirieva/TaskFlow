"use client";

import { Card, message } from "antd";

import styles from "./index.module.css";

import { useCallback, useEffect, useMemo, useState } from "react";

import { createTaskReq, getUsersReq } from "@/api/requests";

import { toCreateTaskRequest } from "@/api/dto/task/create/mapper/toCreateTaskRequest";
import { Executor } from "@/entities/executor.interface";
import { User } from "@/entities/user.interface";
import { TaskWithoutCreatedBy } from "@/utils/types";
import dayjs from "dayjs";
import AddAssigneeForm from "../../../assignees/features/AddAssigneeForm";
import AssigneeRemoval from "../../../assignees/features/RemoveAssigneeModal";
import TaskAssigneesWidget from "../../../assignees/widgets/TaskAssigneesWidget";
import { TaskNote } from "../../../shared";
import ShowMetrics from "../../entities/ShowMetrics";
import TaskHeader from "../../entities/TaskHeader";
import EditTaskForm from "../../features/EditTaskForm";

type TaskWithoutAssignees = Omit<TaskWithoutCreatedBy, "assignees">;

const createEmptyTask = (): TaskWithoutAssignees => ({
  title: "",
  description: "",
  status: "OPEN",
  priority: "medium",
  due_date: new Date(),
  overdueDays: 0,
  hours: { fact: 0, planned: 0 },
  budget: { fact: 0, planned: 0 },
  tags: [],
  task_images: [],
  note: undefined,
  created_at: new Date(),
});

export default function TaskCreator({
  tagsOptions,
}: {
  tagsOptions: { value: string; label: string }[];
}) {
  const [removing, setRemoving] = useState<Executor | null>(null);
  const [adding, setAdding] = useState(false);

  // Задача без assignees
  const [task, updateTask] = useState<TaskWithoutAssignees>(createEmptyTask);

  // Исполнители — отдельный, независимый стейт
  const [assignees, setAssignees] = useState<Executor[]>([]);

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getUsersReq().then(setUsers);
  }, []);

  /** Последнее удаление — для отката */
  const [lastRemoved, setLastRemoved] = useState<{
    assignee: Executor;
    index: number;
  } | null>(null);

  /* ---------- Сохранение задачи ---------- */
  const saveTask = useCallback(
    async (patch: TaskWithoutCreatedBy) => {
      const nextTask: TaskWithoutCreatedBy = {
        ...task,
        ...patch,
        assignees
      };

      await createTaskReq(toCreateTaskRequest(nextTask));
    },
    [task, assignees],
  );

  /* ---------- Удаление ---------- */
  const removeAssignee = (removed: Executor) => {
    setAssignees((prev) => {
      const index = prev.findIndex((a) => a.id === removed.id);
      if (index === -1) return prev;

      setLastRemoved({ assignee: removed, index });
      return prev.filter((a) => a.id !== removed.id);
    });

    setRemoving(null);
    message.success("Исполнитель удалён");
  };

  const undoRemove = () => {
    if (!lastRemoved) return;

    setAssignees((prev) => {
      const next = [...prev];
      next.splice(lastRemoved.index, 0, lastRemoved.assignee);
      return next;
    });

    setLastRemoved(null);
    message.info("Удаление отменено");
  };

  /* ---------- Добавление ---------- */
  const addAssignee = (assignee: Executor) => {
    setAssignees((prev) => {
      const exists = prev.some((a) => a.id === assignee.id);
      if (exists) return prev;
      return [...prev, assignee];
    });

    setAdding(false);
    message.success("Исполнитель добавлен");
  };

  /* ---------- Расчёты по исполнителям ---------- */
  const computeActualBudget = (a: Executor) =>
    a.hourly_rate ? a.hourly_rate * a.hours : 0;

  const computeEstimatedBudget = (a: Executor) =>
    a.hourly_rate ? a.hourly_rate * a.planned : 0;

  const computeActualHours = (a: Executor) => a.hours;
  const computeEstimatedHours = (a: Executor) => a.planned;

  /* ---------- Просрочка ---------- */
  const overdueDays = useMemo(() => {
    if (!task.due_date) return 0;

    const doneStatuses = ["DONE", "CLOSED", "COMPLETED"];
    if (doneStatuses.includes(task.status)) return 0;

    const today = dayjs().startOf("day");
    const dueDate = dayjs(task.due_date).startOf("day");

    if (!dueDate.isBefore(today)) return 0;
    return today.diff(dueDate, "day");
  }, [task.due_date, task.status]);

  // Заголовку задачи тоже нужен объект задачи с исполнителями
  const taskForHeader = useMemo<TaskWithoutCreatedBy>(
    () => ({ ...task, assignees }),
    [task, assignees],
  );

  return (
    <>
      <TaskHeader task={taskForHeader} />
      <div className={styles.grid}>
        <EditTaskForm
          tagsOptions={tagsOptions}
          task={{ ...taskForHeader }} // форма видит полный снапшот, но менять может только свои поля
          updateTask={(patch) => updateTask((prev) => ({ ...prev, ...patch }))}
          saveTask={saveTask}
        />
        <div className={styles.right}>
          <Card
            title={"Эталонные значения для планирования"}
            className={styles.card}
          >
            <ShowMetrics
              due_date={task.due_date?.toLocaleDateString("ru-RU")}
              overdueDays={overdueDays}
              actualBudget={task.budget.fact || 0}
              estimatedBudget={task.budget.planned || 0}
              actualHours={task.hours.fact || 0}
              estimatedHours={task.hours.planned || 0}
            />
          </Card>

          <Card className={styles.card} title={"Запланированные значения"}>
            <ShowMetrics
              due_date={task.due_date?.toLocaleDateString("ru-RU")}
              overdueDays={overdueDays}
              actualBudget={assignees.reduce(
                (prev, cur) => prev + computeActualBudget(cur),
                0,
              )}
              estimatedBudget={assignees.reduce(
                (prev, cur) => prev + computeEstimatedBudget(cur),
                0,
              )}
              actualHours={assignees.reduce(
                (prev, cur) => prev + computeActualHours(cur),
                0,
              )}
              estimatedHours={assignees.reduce(
                (prev, cur) => prev + computeEstimatedHours(cur),
                0,
              )}
            />
            <TaskAssigneesWidget
              assignees={assignees}
              undoRemove={() => undoRemove()}
              showAssigneeAddModal={() => setAdding(true)}
              showAssigneeRemoveModal={setRemoving}
            />
          </Card>

          {task.note && <TaskNote note={task.note} />}
        </div>
      </div>

      <AddAssigneeForm
        isOpen={adding}
        onClose={() => setAdding(false)}
        save={addAssignee}
        users={users}
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