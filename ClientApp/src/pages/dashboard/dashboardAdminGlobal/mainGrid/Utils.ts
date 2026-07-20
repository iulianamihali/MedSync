import {SupportIssuesEnumType} from "../../../../enums/SupportIssuesEnumType";

export const supportIssuesTranslations: Record<SupportIssuesEnumType, string> = {
    [SupportIssuesEnumType.Appointment]: 'Appointment',
    [SupportIssuesEnumType.MedicalData]: 'Medical data',
    [SupportIssuesEnumType.Account]: 'Account',
    [SupportIssuesEnumType.Notification]: 'Notification',
    [SupportIssuesEnumType.Technical]: 'Technical issue',
    [SupportIssuesEnumType.DataPrivacy]: 'Data privacy',
    [SupportIssuesEnumType.Other]: 'Other',
};
