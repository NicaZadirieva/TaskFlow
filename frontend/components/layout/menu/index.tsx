"use client";
import { usePathname } from "next/navigation";
import { Layout, Menu, Button, Typography, Drawer, theme } from "antd";
import type { MenuProps } from "antd";
import { MenuOutlined, LogoutOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { NAV_ITEMS } from "./nav_items_content";
import { buildMenuItems, buildSelection } from "./helper/builders";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const DRAWER_WIDTH = 240;
const MOBILE_BREAKPOINT = 576; // совпадает с sm в antd

export default function SideMenu({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const closeMobile = () => setMobileOpen(false);

  const menuItems: MenuProps["items"] = useMemo(
    () => buildMenuItems(NAV_ITEMS),
    [],
  );

  const { selectedKeys, openKeys } = useMemo(
    () => buildSelection(NAV_ITEMS, pathname),
    [pathname],
  );

  const [controlledOpenKeys, setControlledOpenKeys] =
    useState<string[]>(openKeys);

  useEffect(() => {
    setControlledOpenKeys((prev) => {
      const merged = new Set([...prev, ...openKeys]);
      return Array.from(merged);
    });
  }, [openKeys]);

  // Закрываем drawer при переходе на десктоп
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT}px)`);
    const handle = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileOpen(false);
    };
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, []);

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
          <Button type="primary" size="small" block icon={<LogoutOutlined />}>
            Выход
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <style>{`
        .side-menu-sider { display: none; }
        .side-menu-header { display: flex; }
        .side-menu-content { margin-inline-start: 0; }
        .side-menu-mobile-spacer { height: 64px; }

        @media (min-width: ${MOBILE_BREAKPOINT}px) {
          .side-menu-sider { display: block; }
          .side-menu-header { display: none; }
          .side-menu-content { margin-inline-start: ${DRAWER_WIDTH}px; }
          .side-menu-mobile-spacer { height: 0; }
        }
      `}</style>

      {/* Мобильный хедер — скрыт на десктопе через CSS */}
      <Header
        className="side-menu-header"
        style={{
          position: "fixed",
          width: "100%",
          zIndex: 100,
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

      {/* Десктопный Sider — скрыт на мобилке через CSS */}
      <Sider
        className="side-menu-sider"
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

      <Layout className="side-menu-content" style={{ transition: "margin 0.2s" }}>
        <div className="side-menu-mobile-spacer" />
        <Content style={{ padding: 16, minWidth: 0 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}