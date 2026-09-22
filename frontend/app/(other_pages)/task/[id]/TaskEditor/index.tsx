"use client";



import { Card, message } from "antd";

import styles from "./index.module.css";

import { useState } from "react";
import { Task } from "@/app/api/models/task.interface";
import { Assignee } from "@/app/api/models/assignee.interface";
import { TaskHeader } from "@/app/components/task/edit/features";
import {
  AssigneeAdditor,
  AssigneeRemoval,
  ShowMetrics,
} from "@/app/components/task/view/features";
import { TaskNote } from "@/app/components/task/view/shared";
import EditTaskForm from '@/app/components/task/edit/entities/EditTaskForm';
import Assignees from '@/app/components/task/view/entities/Assignees';

export default function TaskEditor({ task }: { task: Task }) {
  const [removing, setRemoving] = useState<Assignee | null>(null);
  const [adding, setAdding] = useState(false);

  const [editedTask, updateEditedTask]  = useState<Task>(task);

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
      <TaskHeader task={editedTask} />
      <div className={styles.grid}>
        <EditTaskForm task={editedTask} updateTask={updateEditedTask}/>
        <div className={styles.right}>
          <Card className={styles.card}>
            <ShowMetrics
              due_date={editedTask.due_date.toLocaleDateString("ru-RU")}
              overdueDays={editedTask.overdueDays /**TODO: посчитать на фронтенде */}
              actualBudget={editedTask.budget.fact}
              estimatedBudget={editedTask.budget.planned}
              actualHours={editedTask.hours.fact}
              estimatedHours={editedTask.hours.planned}
            />
          </Card>
          <Card className={styles.card}>
            <Assignees
              assignees={editedTask.assignees}
              undoRemove={(assignee) => undoRemove(assignee.id)}
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
