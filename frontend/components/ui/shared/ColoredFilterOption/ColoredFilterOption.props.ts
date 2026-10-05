import { HtmlHTMLAttributes } from "react";
import { FilterOptionData } from "../../task/features/MultipleFilterDropdown/MultipleFilterDropdownProps.props";

export default interface ColoredFilterOptionProps extends HtmlHTMLAttributes<HTMLDivElement> {
    dotHexColor?: string;
    data: FilterOptionData;
    isActive?: boolean;
}

