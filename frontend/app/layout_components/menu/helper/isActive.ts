/**
 * Путь в меню - текущий?
 * @param pathname текущий путь
 * @param menuItemHref путь в меню
 * @returns 
 */
export function isActive(pathname: string | null, menuItemHref: string) {
  if (!pathname) return false;
  if (menuItemHref === "/") return pathname === "/";
  return pathname === menuItemHref;
}