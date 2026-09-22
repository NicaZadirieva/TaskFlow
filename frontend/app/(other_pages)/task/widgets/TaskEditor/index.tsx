"use client";

import { Task } from "@/app/(other_pages)/tasks/interfaces/task.interface";
import TaskHeader from "../../features/TaskHeader";
import EditTaskForm from "../../entities/EditTaskForm";
import { Button, Card, message, Space, Typography } from "antd";
import {
  AssigneeAdditor,
  AssigneeRemoval,
  ShowMetrics,
} from "@/app/(other_pages)/tasks/task/features";
import styles from "./index.module.css";
import { Assignee } from "@/app/(other_pages)/tasks/interfaces/assignee.interface";
import { TaskAssignee } from "@/app/(other_pages)/tasks/task/entities";
import { useMemo, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { TaskNote } from '@/app/(other_pages)/tasks/task/shared';
import Assignees from '../../entities/Assignees';

const { Text } = Typography;

export default function TaskEditor({ task }: { task: Task }) {
   const [removing, setRemoving] = useState<Assignee | null>(null);
  const [adding, setAdding] = useState(false);

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
      <TaskHeader task={task} />
      <div className={styles.grid}>
        <EditTaskForm task={task} />
        <div className={styles.right}>
          <Card className={styles.card}>
            <ShowMetrics
              due_date={task.due_date.toLocaleDateString("ru-RU")}
              overdueDays={task.overdueDays /**TODO: посчитать на фронтенде */}
              actualBudget={task.budget.fact}
              estimatedBudget={task.budget.planned}
              actualHours={task.hours.fact}
              estimatedHours={task.hours.planned}
            />
          </Card>
          <Card className={styles.card}>
            <Assignees assignees={task.assignees} undoRemove={(assignee) => undoRemove(assignee.id)} showAssigneeAddModal={() => setAdding(true)} showAssigneeRemoveModal={setRemoving}/>
          </Card>
		  {task.note && <TaskNote note={task.note}/>}
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
