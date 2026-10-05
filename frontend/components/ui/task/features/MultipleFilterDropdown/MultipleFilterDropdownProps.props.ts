import { HtmlHTMLAttributes } from "react";

export interface FilterOptionData {
  value: string; // на бэкенде
  label: string; // на фронтенде
}

export default interface MultipleFilterDropdownProps extends HtmlHTMLAttributes<HTMLSelectElement> {
  iconSrc?: string; 
  defaultActiveOptions: string[];
  optionsGroupName: string;
}