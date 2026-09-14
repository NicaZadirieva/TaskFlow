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
import AssignmentIcon from '@mui/icons-material/Assignment';
import TuneIcon from '@mui/icons-material/Tune';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ListIcon from '@mui/icons-material/List';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LogoutIcon from '@mui/icons-material/Logout'
import { Button, Paper } from '@mui/material';

const DRAWER_WIDTH = 240;

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: { id: string; label: string; href: string; icon?: React.ReactNode }[];
};
// TODO: добавить tenant_id в пути
const NAV_ITEMS: NavItem[] = [
  {
    id: 'project',
    label: 'Проекты',
    href: '/projects',
    icon: <DashboardIcon />,
    children: [
      { id: 'projects-list', label: 'Просмотр', href: '/projects', icon: <ListAltIcon/> },
      { id: 'projects-add', label: 'Добавить', href: '/projects/new', icon: <AddIcon/> },
      { id: 'projects-edit', label: 'Редактировать', href: '/projects/edit', icon: <EditIcon/> },
    ],
  },
  {
    id: 'users',
    label: 'Пользователи',
    icon: <PeopleIcon />,
    children: [
      { id: 'users-list', label: 'Просмотр', href: '/users', icon: <GroupIcon /> },
      { id: 'users-add', label: 'Добавить', href: '/users/new', icon: <PersonAddIcon /> },
      { id: 'users-edit', label: 'Редактировать', href: '/users/edit', icon: <EditIcon /> },
    ],
  },
  {
    id: 'tasks',
    label: 'Задачи',
    icon: <AssignmentIcon/>,
    children: [
      {
        id: 'tasks-list', label: 'Просмотр', href:'/tasks', icon: <ListAltIcon/>
      },
      {
        id: 'task-add', label: 'Добавить задачу', href:'/task/new', icon: <AddIcon/>
      }
    ]

  },
  {
    id: 'statistics',
    label: 'Статистика',
    icon: <AssessmentIcon />,
    children: [
      { id: 'statistics-dead-tasks', label: 'Просроченные задачи', href: '/statistics/deadtasks', icon: <ListIcon /> },
    ],
  },
  {
    id: 'settings',
    label: 'Настройки',
    icon: <SettingsIcon />,
    children: [
      { id: 'settings-general', label: 'Смена пароля', href: '/settings', icon: <TuneIcon /> }
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
          TaskFlow
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
<Box sx={{ p: 2 }}>
  <Paper
    variant="outlined"
    sx={{
      p: 1.5,
      borderRadius: 2,
      bgcolor: 'action.hover',
    }}
  >
    <Typography variant="caption" color="text.secondary">
      Компания
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }} noWrap>
      Моя компания
    </Typography>
    <Button
      size="small"
      variant="contained"
      color="primary"
      fullWidth
      startIcon={<LogoutIcon />}
    >
      Выход
    </Button>
  </Paper>
</Box>
    
      
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
            TaskFlow
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
  return pathname === href;
}