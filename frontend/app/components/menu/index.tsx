"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layout, Menu, Button, Typography, Drawer, Grid, theme } from "antd";
import type { MenuProps } from "antd";
import {
  MenuOutlined,
  DashboardOutlined,
  TeamOutlined,
  SettingOutlined,
  BarChartOutlined,
  UserAddOutlined,
  UsergroupAddOutlined,
  EditOutlined,
  UnorderedListOutlined,
  PlusOutlined,
  LogoutOutlined,
  FileTextOutlined,
  ToolOutlined,
  ProfileOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const DRAWER_WIDTH = 240;

type NavItem = {
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
const NAV_ITEMS: NavItem[] = [
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
    children: [
      {
        id: "users-list",
        label: "Просмотр",
        href: "/users",
        icon: <UsergroupAddOutlined />,
      },
      {
        id: "users-add",
        label: "Добавить",
        href: "/users/new",
        icon: <UserAddOutlined />,
      },
      {
        id: "users-edit",
        label: "Редактировать",
        href: "/users/edit",
        icon: <EditOutlined />,
      },
    ],
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

// --- хелпер активного пути ---
function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href;
}

export default function SideMenu({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const screens = useBreakpoint();
  const isMobile = !screens.sm;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const closeMobile = () => setMobileOpen(false);

  // Строим items для antd Menu
  const menuItems: MenuProps["items"] = React.useMemo(
    () =>
      NAV_ITEMS.map((item) => {
        if (!item.children) {
          return {
            key: item.href!,
            icon: item.icon,
            label: <Link href={item.href!}>{item.label}</Link>,
          };
        }
        return {
          key: item.id,
          icon: item.icon,
          label: item.label,
          children: item.children.map((child) => ({
            key: child.href,
            icon: child.icon,
            label: <Link href={child.href}>{child.label}</Link>,
          })),
        };
      }),
    [],
  );

  // Определяем открытые группы и выбранный пункт
  const { selectedKeys, openKeys } = React.useMemo(() => {
    const selected: string[] = [];
    const opened: string[] = [];

    // Точное совпадение по href
    for (const item of NAV_ITEMS) {
      if (item.children) {
        const matchedChild = item.children.find((c) =>
          isActive(pathname, c.href),
        );
        if (matchedChild) {
          selected.push(matchedChild.href);
          opened.push(item.id);
        }
      } else if (item.href && isActive(pathname, item.href)) {
        selected.push(item.href);
      }
    }

    return { selectedKeys: selected, openKeys: opened };
  }, [pathname]);

  const [controlledOpenKeys, setControlledOpenKeys] =
    React.useState<string[]>(openKeys);

  // Синхронизация openKeys при смене маршрута
  React.useEffect(() => {
    setControlledOpenKeys((prev) => {
      const merged = new Set([...prev, ...openKeys]);
      return Array.from(merged);
    });
  }, [openKeys]);

  const drawerContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          fontWeight: 600,
          fontSize: 18,
        }}
      >
        TaskFlow
      </div>

      <Menu
        mode="inline"
        items={menuItems}
        selectedKeys={selectedKeys}
        openKeys={controlledOpenKeys}
        onOpenChange={setControlledOpenKeys}
        onClick={closeMobile}
        style={{ flex: 1, borderInlineEnd: 0 }}
      />

      <div style={{ padding: 16 }}>
        <div
          style={{
            padding: 12,
            borderRadius: borderRadiusLG,
            background: colorBgContainer,
            border: "1px solid rgba(5,5,5,0.06)",
          }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            Компания
          </Text>
          <div
            style={{
              fontWeight: 600,
              marginBottom: 8,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            Моя компания
          </div>
          <Button
            type="primary"
            size="small"
            block
            icon={<LogoutOutlined />}
          >
            Выход
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Верхняя панель только на мобилке */}
      {isMobile && (
        <Header
          style={{
            position: "fixed",
            width: "100%",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            background: colorBgContainer,
          }}
        >
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileOpen(true)}
            style={{ marginRight: 16 }}
            aria-label="open menu"
          />
          <span style={{ fontWeight: 600, fontSize: 18 }}>TaskFlow</span>
        </Header>
      )}

      {/* Мобильный Drawer */}
      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={closeMobile}
        styles={{ body: { padding: 0 } }}
        size={DRAWER_WIDTH}
      >
        {drawerContent}
      </Drawer>

      {/* Десктопный Sider */}
      {!isMobile && (
        <Sider
          width={DRAWER_WIDTH}
          theme="light"
          style={{
            overflow: "auto",
            height: "100vh",
            position: "fixed",
            insetInlineStart: 0,
            top: 0,
            bottom: 0,
            borderInlineEnd: "1px solid rgba(5,5,5,0.06)",
          }}
        >
          {drawerContent}
        </Sider>
      )}

      <Layout
        style={{
          marginInlineStart: isMobile ? 0 : DRAWER_WIDTH,
          transition: "margin 0.2s",
        }}
      >
        {isMobile && <div style={{ height: 64 }} />}
        <Content
          style={{
            padding: 16,
            minWidth: 0,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}