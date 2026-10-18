"use client";
import { fromTaskOut } from "@/api/dto/task/get_tasks/mapper/fromTaskOut";
import getTasksClientReq from "@/api/requests/task/get_tasks/client/req";
import getClientUsersReq from "@/api/requests/user/get_users/client/get_users.req";
import { Task } from "@/entities/task.interface";
import { User } from "@/entities/user.interface";
import { useQuery } from "@tanstack/react-query";
import TaskInKanban from "../../entities/TaskInKanban";

export default function TasksInKanban({
  initialTasks,
  initialUsers,
  search,
}: {
  initialTasks: Task[];
  initialUsers: User[];
  search: string;
}) {
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", search],
    queryFn: () =>
      getTasksClientReq(search ? new URLSearchParams(search) : undefined).then(
        (d) => d.items.map(fromTaskOut),
      ),
    initialData: initialTasks,
    refetchInterval: 5_000,
    refetchIntervalInBackground: false,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => getClientUsersReq().then((d) => d.users),
    initialData: initialUsers,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20, maxWidth: 1200, margin: "0 auto" }}>
      {tasks.map((t) => <TaskInKanban key={t.id} task={t} users={users} />)}
    </div>
  );
}