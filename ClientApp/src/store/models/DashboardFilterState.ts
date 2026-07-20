import type {DropDownFilterEnum} from "../../enums/DropDownFilterEnum";

export interface DashboardFilterState {
    selectedPeriod: DropDownFilterEnum;
    from: string;
    to: string;
}