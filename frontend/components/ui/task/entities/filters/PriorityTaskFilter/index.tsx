import MultipleFilterDropdown from "../../../features/MultipleFilterDropdown";
import { FilterOptionData } from "../../../features/MultipleFilterDropdown/MultipleFilterDropdownProps.props";


const STORAGE: FilterOptionData[] = [
    { label: 'LOW', value: 'LOW', dotHexColor: 'grey' },
    { label: 'MEDIUM', value: 'MEDIUM', dotHexColor: 'blue' },
    { label: 'HIGH', value: 'HIGH', dotHexColor: 'orange' },
    { label: 'CRITICAL', value: 'CRITICAL', dotHexColor: 'red' },
];
export default function PriorityTaskFilter() {
    return <MultipleFilterDropdown storage={STORAGE} optionsGroupName="Приоритет" widthInPx={170} />
}