import MultipleFilterDropdown from "../../features/MultipleFilterDropdown";
import { FilterOptionData } from "../../features/MultipleFilterDropdown/MultipleFilterDropdownProps.props";

const STORAGE: FilterOptionData[] = [
    { label: 'OPEN', value: 'OPEN', dotHexColor: 'blue' },
    { label: 'IN_PROGRESS', value: 'IN_PROGRESS', dotHexColor: 'orange' },
    { label: 'DONE', value: 'DONE', dotHexColor: 'green' },
    { label: 'BACKLOG', value: 'BACKLOG', dotHexColor: 'yellow' },
];
export default function StatusTaskFilter() {
    return <MultipleFilterDropdown storage={STORAGE} optionsGroupName="Статус" widthInPx={150}/>
}