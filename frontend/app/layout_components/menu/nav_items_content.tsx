import {
  DashboardOutlined,
  TeamOutlined,
  SettingOutlined,
  BarChartOutlined,
  UserAddOutlined,
  UsergroupAddOutlined,
  EditOutlined,
  UnorderedListOutlined,
  PlusOutlined,
  FileTextOutlined,
  ToolOutlined,
  ProfileOutlined,
} from "@ant-design/icons";

export type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  }[];
};

// TODO: добавить tenant_id в пути
export const NAV_ITEMS: NavItem[] = [
  {
    id: "project",
    label: "Проекты",
    href: "/projects",
    icon: <DashboardOutlined />,
    children: [
      {
        id: "projects-list",
        label: "Просмотр",
        href: "/projects",
        icon: <ProfileOutlined />,
      },
      {
        id: "projects-add",
        label: "Добавить",
        href: "/projects/new",
        icon: <PlusOutlined />,
      },
      {
        id: "projects-edit",
        label: "Редактировать",
        href: "/projects/edit",
        icon: <EditOutlined />,
      },
    ],
  },
  {
    id: "users",
    label: "Пользователи",
    icon: <TeamOutlined />,
    href: "/users"
  },
  {
    id: "tasks",
    label: "Задачи",
    icon: <FileTextOutlined />,
    children: [
      {
        id: "tasks-list",
        label: "Просмотр",
        href: "/tasks",
        icon: <UnorderedListOutlined />,
      },
      {
        id: "task-add",
        label: "Добавить задачу",
        href: "/task/new",
        icon: <PlusOutlined />,
      },
    ],
  },
  {
    id: "statistics",
    label: "Статистика",
    icon: <BarChartOutlined />,
    children: [
      {
        id: "statistics-dead-tasks",
        label: "Просроченные задачи",
        href: "/statistics/deadtasks",
        icon: <UnorderedListOutlined />,
      },
    ],
  },
  {
    id: "settings",
    label: "Настройки",
    icon: <SettingOutlined />,
    children: [
      {
        id: "settings-general",
        label: "Смена пароля",
        href: "/settings",
        icon: <ToolOutlined />,
      },
    ],
  },
];