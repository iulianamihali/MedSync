import "./SupportIssueForm.scss";
import { useState } from "react";
import {Box, Button} from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import {SupportIssuesEnumType} from "../../../enums/SupportIssuesEnumType";
import useAuth from "../../../store/features/auth/authHook";
import GlobalSettings from '../../../GlobalSettings.json';
import axiosUtil from "../../../common/axiosUtil";

type Props = {
    onSuccess: () => void;
};

const categories = [
    { type: SupportIssuesEnumType.Appointment,  label: "Appointment",  icon: CalendarMonthOutlinedIcon,     color: "#3b82f6", bg: "#eff6ff" },
    { type: SupportIssuesEnumType.MedicalData,  label: "Medical data", icon: MedicalServicesOutlinedIcon,   color: "#10b981", bg: "#ecfdf5" },
    { type: SupportIssuesEnumType.Account,      label: "Account",      icon: PersonOutlineIcon,             color: "#8b5cf6", bg: "#f5f3ff" },
    { type: SupportIssuesEnumType.Notification, label: "Notification", icon: NotificationsNoneOutlinedIcon, color: "#f59e0b", bg: "#fffbeb" },
    { type: SupportIssuesEnumType.Technical,    label: "Technical",    icon: BuildOutlinedIcon,             color: "#ef4444", bg: "#fef2f2" },
    { type: SupportIssuesEnumType.DataPrivacy,  label: "Privacy",      icon: LockOutlinedIcon,              color: "#64748b", bg: "#f8fafc" },
    { type: SupportIssuesEnumType.Other,        label: "Other",        icon: ChatBubbleOutlineOutlinedIcon, color: "#06b6d4", bg: "#ecfeff" },
];

const SupportIssueForm = (props: Props) => {
    const userId = useAuth()?.user?.sub;
    const [selectedType, setSelectedType] = useState<SupportIssuesEnumType | null>(null);
    const [description, setDescription] = useState("");
    const isFormValid = () => selectedType !== null && description.trim().length > 0;

    const handleSubmit = () => {
        const url = `${GlobalSettings.supportIssues}/addSupportIssue`;
        axiosUtil.post(url, {
            userId,
            issueType: selectedType,
            description,
        })
            .then(() => {
                props.onSuccess()
            })
            .catch(err => console.error(err));
    };

    return (
        <Box className="support-issue-form">

            <Box className="support-issue-form__section-header">
                <span>Category</span>
            </Box>

            <Box className="support-issue-form__categories">
                {categories.map(({ type, label, icon: Icon, color, bg }) => {
                    const isActive = selectedType === type;
                    return (
                        <Box
                            key={type}
                            className="support-issue-form__card"
                            onClick={() => setSelectedType(type)}
                            style={{
                                borderColor: isActive ? color : "#f0f0f0",
                                backgroundColor: isActive ? bg : "#ffffff",
                                borderWidth: isActive ? "2px" : "1.5px",
                            }}
                        >
                            <Icon style={{ color, fontSize: 22 }} />
                            <span style={{ color: isActive ? color : "#78909c", fontWeight: isActive ? 600 : 500 }}>
                                {label}
                            </span>
                        </Box>
                    );
                })}
            </Box>

            <Box className="support-issue-form__section-header">
                <span>Description</span>
            </Box>

            <textarea
                className="support-issue-form__textarea"
                placeholder="Describe your issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={255}
            />
            <span className="support-issue-form__char-count">{description.length}/255</span>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                <Button
                    onClick={handleSubmit}
                    disabled={!isFormValid()}
                    variant="contained"
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        padding: 0.9,
                        backgroundImage: !isFormValid()
                            ? "linear-gradient(to bottom, #bdbdbd, #757575)"
                            : "linear-gradient(to bottom, hsl(220, 20%, 25%), hsl(220, 30%, 6%))",
                        border: !isFormValid() ? "1px solid #9e9e9e" : "1px solid hsl(220, 20%, 25%)",
                        boxShadow: !isFormValid() ? "none" : "inset 0 1px 0 hsl(220, 20%, 35%), inset 0 -1px 0 1px hsl(220, 0%, 0%)",
                        "&:hover": {
                            backgroundImage: !isFormValid()
                                ? "linear-gradient(to bottom, #bdbdbd, #757575)"
                                : "linear-gradient(to bottom, hsl(220, 25%, 30%), hsl(220, 30%, 10%))",
                        },
                        opacity: !isFormValid() ? 0.7 : 1,
                    }}
                >
                    Submit
                </Button>
            </Box>

        </Box>


    );
};

export default SupportIssueForm;