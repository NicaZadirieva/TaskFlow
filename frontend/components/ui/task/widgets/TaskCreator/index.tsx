"use client";

import { Card, message } from "antd";

import styles from "./index.module.css";

import { useCallback, useMemo, useState } from "react";

import { createTaskReq } from "@/api/requests";

import { toCreateTaskRequest } from "@/api/dto/task/create/mapper/toCreateTaskRequest";
import getClientUsersReq from "@/api/requests/user/get_users/client/get_users.req";
import { Executor } from "@/entities/executor.interface";
import { User } from "@/entities/user.interface";
import { NewTask, TaskWithoutAssignees, TaskWithoutCreatedBy } from "@/utils/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import AddAssigneeForm from "../../../assignees/features/AddAssigneeForm";
import AssigneeRemoval from "../../../assignees/features/RemoveAssigneeModal";
import TaskAssigneesWidget from "../../../assignees/widgets/TaskAssigneesWidget";
import { TaskNote } from "../../../shared";
import ShowMetrics from "../../entities/ShowMetrics";
import TaskHeader from "../../entities/TaskHeader";
import EditTaskForm from "../../features/EditTaskForm";

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
  initialUsers
}: {
  tagsOptions: { value: string; label: string }[];
    initialUsers?: User[];
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  const [removing, setRemoving] = useState<Executor | null>(null);
  const [adding, setAdding] = useState(false);

  // Задача без assignees
  const [task, updateTask] = useState<TaskWithoutAssignees>(createEmptyTask);

  // Исполнители — отдельный, независимый стейт
  const [assignees, setAssignees] = useState<Executor[]>([]);

  /* ---------- Справочник пользователей ---------- */
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => getClientUsersReq().then((d) => d.users),
    initialData: initialUsers,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  /** Последнее удаление — для отката */
  const [lastRemoved, setLastRemoved] = useState<{
    assignee: Executor;
    index: number;
  } | null>(null);

  /* ---------- Сохранение задачи ---------- */
  const saveTaskMutation = useMutation({
    mutationFn: (patch: TaskWithoutCreatedBy | NewTask) => {
      const nextTask: TaskWithoutCreatedBy | NewTask = { ...task, ...patch, assignees };
      return createTaskReq(toCreateTaskRequest(nextTask));
    },

    onSuccess: (created) => {
      // 1. Список задач на доске должен увидеть новую задачу
      queryClient.invalidateQueries({ queryKey: ["tasks"] });

      // 2. Если API вернул созданную задачу — можно оптимистично добавить её в кэш
      // (не обязательно, invalidate уже даст актуальные данные через refetch)

      message.success("Задача создана");

      // 3. Уйти с формы создания — например, на страницу задачи или на доску
      // Зависит от того, что возвращает createTaskReq:
      // router.push(`/tasks/${created.id}`)
      router.push("/tasks");
    },

    onError: (err) => {
      console.error(err);
      message.error("Не удалось создать задачу");
    },
  });

  const saveTask = useCallback(
    (patch: TaskWithoutCreatedBy | NewTask) => { saveTaskMutation.mutateAsync(patch) },
    [saveTaskMutation],
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
    a.hourly_rate && a.hours ? a.hourly_rate * a.hours : 0;

  const computeEstimatedBudget = (a: Executor) =>
    a.hourly_rate && a.planned ? a.hourly_rate * a.planned : 0;

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

  const taskForForm = useMemo<NewTask>(
    () => ({ ...task, assignees }),
    [task, assignees],
  );

  return (
    <>
      <TaskHeader title={task.title} description={task.description} status={task.status} priority={task.priority}
      tags={task.tags} />
      <div className={styles.grid}>
        <EditTaskForm
          tagsOptions={tagsOptions}
          task={{ ...taskForForm }} // форма видит полный снапшот, но менять может только свои поля
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
                (prev, cur) => prev + (computeActualBudget(cur) || 0),
                0,
              )}
              estimatedBudget={assignees.reduce(
                (prev, cur) => prev + (computeEstimatedBudget(cur) || 0),
                0,
              )}
              actualHours={assignees.reduce(
                (prev, cur) => prev + (computeActualHours(cur) || 0),
                0,
              )}
              estimatedHours={assignees.reduce(
                (prev, cur) => prev + (computeEstimatedHours(cur) || 0),
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