'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';

import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupIcon from '@mui/icons-material/Group';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TuneIcon from '@mui/icons-material/Tune';
import SecurityIcon from '@mui/icons-material/Security';

const DRAWER_WIDTH = 240;

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: { id: string; label: string; href: string; icon?: React.ReactNode }[];
};

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Дашборд',
    href: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    id: 'users',
    label: 'Пользователи',
    icon: <PeopleIcon />,
    children: [
      { id: 'users-list', label: 'Список', href: '/users', icon: <GroupIcon /> },
      { id: 'users-add', label: 'Добавить', href: '/users/new', icon: <PersonAddIcon /> },
    ],
  },
  {
    id: 'reports',
    label: 'Отчёты',
    icon: <AssessmentIcon />,
    children: [
      { id: 'reports-bar', label: 'Продажи', href: '/reports/sales', icon: <BarChartIcon /> },
      { id: 'reports-pie', label: 'Трафик', href: '/reports/traffic', icon: <PieChartIcon /> },
    ],
  },
  {
    id: 'settings',
    label: 'Настройки',
    icon: <SettingsIcon />,
    children: [
      { id: 'settings-general', label: 'Общие', href: '/settings', icon: <TuneIcon /> },
      { id: 'settings-security', label: 'Безопасность', href: '/settings/security', icon: <SecurityIcon /> },
    ],
  },
];

export default function SideMenu() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const handleToggle = () => setMobileOpen((v) => !v);
  const closeMobile = () => setMobileOpen(false);

  // какие разделы раскрыты
  const [open, setOpen] = React.useState<Record<string, boolean>>({});

  const handleGroupToggle = (id: string) => {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // авто-раскрытие раздела, если текущий путь внутри него
  React.useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const item of NAV_ITEMS) {
      if (item.children?.some((c) => isActive(pathname, c.href))) {
        next[item.id] = true;
      }
    }
    setOpen((prev) => ({ ...prev, ...next }));
  }, [pathname]);

  const drawerContent = (
    <>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          My App
        </Typography>
      </Toolbar>
      <Divider />
      <List component="nav" aria-label="main navigation">
        {NAV_ITEMS.map((item) => {
          // --- Одиночный пункт без детей ---
          if (!item.children) {
            return (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.href!}
                  selected={isActive(pathname, item.href!)}
                  onClick={closeMobile}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            );
          }

          // --- Группа с подменю ---
          const isOpen = !!open[item.id];
          const isGroupActive = item.children.some((c) =>
            isActive(pathname, c.href)
          );

          return (
            <React.Fragment key={item.id}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleGroupToggle(item.id)}
                  selected={isGroupActive && !isOpen}
                  aria-expanded={isOpen}
                  aria-controls={`submenu-${item.id}`}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                  {isOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
              </ListItem>

              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding id={`submenu-${item.id}`}>
                  {item.children.map((child) => (
                    <ListItem key={child.id} disablePadding>
                      <ListItemButton
                        component={Link}
                        href={child.href}
                        selected={isActive(pathname, child.href)}
                        onClick={closeMobile}
                        sx={{ pl: 4 }} // отступ вложенного уровня
                      >
                        {child.icon && (
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            {child.icon}
                          </ListItemIcon>
                        )}
                        <ListItemText primary={child.label} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          );
        })}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Верхняя панель только на мобилке */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          display: { sm: 'none' },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleToggle}
            sx={{ mr: 2 }}
            aria-label="open menu"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            My App
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Навигация */}
      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
        aria-label="navigation"
      >
        {/* Мобильная — временная */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            [`& .MuiDrawer-paper`]: {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Десктопная — постоянная */}
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', sm: 'block' },
            [`& .MuiDrawer-paper`]: {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>
    </Box>
  );
}

// --- хелпер активного пути ---
function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}