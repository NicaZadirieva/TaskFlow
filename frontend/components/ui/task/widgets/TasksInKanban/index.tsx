'use client';
import { getUsersReq } from "@/api/requests";
import { Task } from "@/entities/task.interface";
import { User } from "@/entities/user.interface";
import { useEffect, useState } from "react";
import TaskInKanban from "../../entities/TaskInKanban";


export default function TasksInKanban({ tasks }: { tasks: Task[] }) {
  const [taskCache, updateTaskCache] = useState(tasks);
  const updateTask = (taskId: number, updater: (prev: Task) => Task) => {
    updateTaskCache(prev => prev.map(t => t.id === taskId ? updater(t) : t));
  };

  const [users, setUsers] = useState<User[]>([]);
  
    useEffect(() => {
      getUsersReq().then(setUsers);
    }, []);
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
          gap: 20,
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {taskCache.map((t) => (
          <TaskInKanban key={t.id} task={t} updateTask={updateTask} users={users}/>
        ))}
      </div>

      <style>{`
        .assignee-actions { opacity: 0; transition: opacity .15s ease; }
        .assignee-row:hover { background: #f9fafb; }
        .assignee-row:hover .assignee-actions { opacity: 1; }
      `}</style>
    </>
  );
}
