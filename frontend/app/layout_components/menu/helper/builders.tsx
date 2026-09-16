import { MenuProps } from 'antd';
import { NavItem } from '../nav_items_content';
import Link from 'next/link';
import  { isActive } from './isActive';

/**
 * Построение элементов меню
 * @param navItems 
 * @returns 
 */
export const buildMenuItems = (navItems: NavItem[]): MenuProps["items"] =>
  navItems.map((item) =>
    item.children
      ? {
          key: item.id,
          icon: item.icon,
          label: item.label,
          children: item.children.map((child) => ({
            key: child.href,
            icon: child.icon,
            label: <Link href={child.href}>{child.label}</Link>,
          })),
        }
      : {
          key: item.href!,
          icon: item.icon,
          label: <Link href={item.href!}>{item.label}</Link>,
        },
  );

/**
 * Определить, какие пункты меню активны
 * @param navItems элементы меню
 * @param pathname текущий путь
 * @returns 
 */
export const buildSelection = (navItems: NavItem[], pathname: string) => {
  const selected: string[] = [];
  const opened: string[] = [];

  for (const item of navItems) {
    if (item.children) {
      const matched = item.children.find((c) => isActive(pathname, c.href));
      if (matched) {
        selected.push(matched.href);
        opened.push(item.id);
      }
    } else if (item.href && isActive(pathname, item.href)) {
      selected.push(item.href);
    }
  }

  return { selectedKeys: selected, openKeys: opened };
};