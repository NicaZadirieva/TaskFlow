"use client";

import { Card, message } from "antd";

import styles from "./index.module.css";

import { useState } from "react";

import { Assignee } from "@/app/api/models/assignee.interface";
import { Task } from '@/app/api/models/task.interface';
import { TaskHeader } from '@/app/components/task/edit/features';
import { AssigneeAdditor, AssigneeRemoval, ShowMetrics } from '@/app/components/task/view/features';
import Assignees from '@/app/components/task/view/entities/Assignees';
import EditTaskForm from '@/app/components/task/edit/entities/EditTaskForm';
import { TaskNote } from '@/app/components/task/view/shared';

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

  /* ---------- Удаление ---------- */
  const undoRemove = (id: number) => {
    message.info("Удаление отменено");
  };
  const removeAssignee = (updated: Assignee) => {
    message.success("Исполнитель удалён");
  };

  /* ---------- Добавление ---------- */
  const addAssignee = (assignee: Assignee) => {
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
              undoRemove={(assignee: Assignee) => undoRemove(assignee.id)}
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
