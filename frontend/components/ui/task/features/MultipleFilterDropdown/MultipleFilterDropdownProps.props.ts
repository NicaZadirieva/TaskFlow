
export interface FilterOptionData {
  value: string; // на бэкенде
  label: string; // на фронтенде
  dotHexColor?: string;
}

export default interface MultipleFilterDropdownProps {
  iconSrc?: string; 
  optionsGroupName: string;
  widthInPx: number;
  storage: FilterOptionData[];
  showSearch?: boolean;
  value?: string[];
  onChange: (values: string[]) => void;
}