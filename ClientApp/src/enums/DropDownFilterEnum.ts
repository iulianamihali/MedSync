import useAuth from "../store/features/auth/authHook";

export enum DropDownFilterEnum {
    Today = 'Today',
    ThisWeek = 'This Week',
    LastWeek = 'Last Week',
    NextWeek = 'Next Week',
    ThisMonth = 'This Month',
    LastMonth = 'Last Month',
    ThisYear = 'This Year',
    LastYear = 'Last Year',
    Custom = 'Custom',
}

export const dropDownFilterValues = [
    {
        id: DropDownFilterEnum.Today,
        text: "Today",
    },
    {
        id: DropDownFilterEnum.ThisWeek,
        text: "This Week",
    },
    {
        id: DropDownFilterEnum.LastWeek,
        text: "Last Week",
    },
    {
        id: DropDownFilterEnum.NextWeek,
        text: "Next Week",
    },
    {
        id: DropDownFilterEnum.ThisMonth,
        text: "This Month",
    },
    {
        id: DropDownFilterEnum.LastMonth,
        text: "Last Month",
    },
    {
        id: DropDownFilterEnum.ThisYear,
        text: "This Year",
    },
    {
        id: DropDownFilterEnum.LastYear,
        text: "Last Year",
    },
    {
        id: DropDownFilterEnum.Custom,
        text: "Custom",
    }
]