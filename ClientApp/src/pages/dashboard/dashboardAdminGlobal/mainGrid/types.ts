import type {StatCardsProps} from "../../../../components/StatCard";
import type {SupportIssuesEnumType} from "../../../../enums/SupportIssuesEnumType";

export type StatCardsResponseDto = {
    patients: StatCardsProps;
    doctors: StatCardsProps;
    institutions: StatCardsProps;
}

export type SupportBarChartStatPoints = {
    type: SupportIssuesEnumType,
    value: number
}

export type PieChartData = {
    name: string;
    percentage: number;
    total: number;
}
