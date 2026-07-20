import {
    Box,
    Typography,
    TextField,
    Checkbox,
    ListItemText,
    Autocomplete,
    Button,
} from "@mui/material";
import type {ExistingSpecialtyServices} from "./ServicesPage";
import type {SelectOptionDto} from "./AddSpecialtyServicesView";
import {useMemo, useState} from "react";


type Props = {
    existingData: ExistingSpecialtyServices;
    setExistingData: (newData: ExistingSpecialtyServices) => void;
    allServices: SelectOptionDto[];
    onClickCallBack: (services: SelectOptionDto[]) => void;
} & {
    onSuccess: () => void;
}

export default function AddServicesToExistingSpecialtyView(props: Props) {

    const [addNewServices, setAddNewServices] = useState<SelectOptionDto[]>([]);
    const selectedOptions = useMemo(() => {
        if(!props.allServices.length)
            return [];
        const selectedServicesProps = props.allServices.filter(s =>
            props.existingData.selectedServices.includes(s.id));
        const combined = [...selectedServicesProps, ...addNewServices];

        const unique = Array.from(
            new Map(combined.map(s => [s.id, s])).values()
        );

        return unique;

    },[props.allServices, props.existingData?.selectedServices, addNewServices]);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                p: 1,
            }}
        >
            <Typography variant="body2" color="text.secondary">
                Select additional services for the existing specialty.
            </Typography>

            <Box>
                <Typography
                    variant="caption"
                    sx={{
                        fontWeight: 500,
                        color: "text.secondary",
                        mb: 0.5,
                        display: "block",
                    }}
                >
                    SPECIALTY
                </Typography>

                <TextField
                    value={props.existingData?.specialtyName}
                    disabled
                    size="small"
                    placeholder="Selected specialty"
                    fullWidth
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            height: 44,
                            fontSize: 14,
                            borderRadius: 2,
                            backgroundColor: "#f5f5f5",
                        },
                    }}
                />
            </Box>

            <Box>
                <Typography
                    variant="caption"
                    sx={{
                        fontWeight: 500,
                        color: "text.secondary",
                        mb: 0.5,
                        display: "block",
                    }}
                >
                    SERVICES
                </Typography>

                <Autocomplete
                    onChange={(_, value) => {
                        const onlySelectedValuesInPopup = value.filter((x) => !props.existingData.selectedServices.includes(x.id) );
                        setAddNewServices(onlySelectedValuesInPopup);
                    }}
                    multiple
                    options={props.allServices ?? []}
                    value={
                        selectedOptions
                    }
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    disableCloseOnSelect
                    getOptionLabel={(option) => option.name}
                    renderOption={(props, option, { selected }) => (
                        <li {...props} key={option.id}>
                            <Checkbox size="small" checked={selected} />
                            <ListItemText primary={option.name} />
                        </li>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            size="small"
                            placeholder="Select one or more services"
                        />
                    )}
                />

            </Box>

            <Button
                disabled={addNewServices.length === 0}
                onClick={() =>
                {
                    props.onClickCallBack(addNewServices);
                    props.onSuccess();
                }}
                sx={{
                    px: 3,
                    py: 0.8,
                    borderRadius: 1.5,
                    textTransform: "none",
                    fontSize: 13,
                    fontWeight: 500,
                    bgcolor: "#5B9FD8",
                    color: "white",
                    "&:hover": {
                        bgcolor: "#4A8BC2",
                    },
                    "&:disabled": {
                        bgcolor: "#E5EDF5",
                        color: "#94a3b8",
                    },
                }}
            >
                Add services
            </Button>
        </Box>
    );
}
