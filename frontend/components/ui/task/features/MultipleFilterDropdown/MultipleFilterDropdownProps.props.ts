import { HtmlHTMLAttributes } from "react";

export interface FilterOptionData {
  value: string; // на бэкенде
  label: string; // на фронтенде
  dotHexColor: string;
}

export default interface MultipleFilterDropdownProps extends HtmlHTMLAttributes<HTMLSelectElement> {
  iconSrc?: string; 
  activeOptions?: string[];
  optionsGroupName: string;
  widthInPx: number;
  storage: FilterOptionData[];
  showSearch?: boolean;
}