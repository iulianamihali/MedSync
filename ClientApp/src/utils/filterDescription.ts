import { useAppSelector } from "../store/hook";
import { DropDownFilterEnum } from "../enums/DropDownFilterEnum";
import { format } from "date-fns";

export const useFilterDescription = () => {
    const from = useAppSelector((state) => state.dashboardFilter.from);
    const to = useAppSelector((state) => state.dashboardFilter.to);
    const selectedPeriod = useAppSelector(
        (state) => state.dashboardFilter.selectedPeriod
    );

    const getDescription = () => {
        switch (selectedPeriod) {
            case DropDownFilterEnum.Today:
                return "Today";
            case DropDownFilterEnum.ThisWeek:
                return "For this week";
            case DropDownFilterEnum.LastWeek:
                return "For the last week";
            case DropDownFilterEnum.NextWeek:
                return "For the next week";
            case DropDownFilterEnum.ThisMonth:
                return "For this month";
            case DropDownFilterEnum.LastMonth:
                return "For the last month";
            case DropDownFilterEnum.ThisYear:
                return "For this year";
            case DropDownFilterEnum.LastYear:
                return "For the last year";
            case DropDownFilterEnum.Custom:
                if (from && to) {
                    const formattedFrom = format(new Date(from), "dd MMM yyyy");
                    const formattedTo = format(new Date(to), "dd MMM yyyy");
                    return `From ${formattedFrom} to ${formattedTo}`;
                }
                return "For the selected custom period";
            default:
                return "";
        }
    };

    return getDescription();
};
