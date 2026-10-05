import { HtmlHTMLAttributes } from "react";
import { FilterOptionData } from "../../MultipleFilterDropdownProps.props";

export default interface ColoredFilterOptionProps extends HtmlHTMLAttributes<HTMLDivElement> {
    dotHexColor?: string;
    data: FilterOptionData;
    isActive?: boolean;
}

