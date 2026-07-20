import "./AddPersonForm.scss";
import {useState} from "react";
import {Box, TextField, MenuItem, Button} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import useAuth from "../../../store/features/auth/authHook";
import GlobalSettings from "../../../GlobalSettings.json";
import axiosUtil from "../../../common/axiosUtil";
import {RelationshipType} from "../../../enums/RelationshipType";

type AddPersonFormData = {
    ownerId: string;
    firstName: string;
    lastName: string;
    cnp: string;
    dateOfBirth: string;
    relationship: RelationshipType;
};
type Props = {
    onSuccess: () => void;
}

const AddPersonForm = (props: Props) => {
    const patientId = useAuth()?.user?.sub;
    const [addPerson, setAddPerson] = useState<AddPersonFormData>({
        ownerId: patientId ? patientId : "",
        firstName: "",
        lastName: "",
        cnp: "",
        dateOfBirth: "",
        relationship: 0,
    });

    const addPersonMethod = () => {
        const url = `${GlobalSettings.careGiving}/add-person`;
        axiosUtil.post<boolean>(url, addPerson)
            .then(res => {
                if(res.data)
                    props.onSuccess();
            })
            .catch(err => {
                console.error(err);
            })
    }

    const isFormValid = () => {
        return addPerson.firstName && addPerson.lastName && addPerson.cnp && addPerson.dateOfBirth && addPerson.relationship && addPerson.ownerId;
    }

    return (
        <Box className="add-person-form">

            <Box>
                <Box className="add-person-form__section-header">
                    <PersonOutlineIcon />
                    <span>Personal information</span>
                </Box>
                <Box className="add-person-form__row">
                    <TextField
                        label="First name"
                        value={addPerson.firstName}
                        onChange={(e) => setAddPerson({ ...addPerson, firstName: e.target.value })}
                        fullWidth
                        required
                        size="small"
                    />
                    <TextField
                        label="Last name"
                        value={addPerson.lastName}
                        onChange={(e) => setAddPerson({ ...addPerson, lastName: e.target.value })}
                        fullWidth
                        required
                        size="small"
                    />
                </Box>
            </Box>

            <Box>
                <Box className="add-person-form__section-header">
                    <BadgeOutlinedIcon />
                    <span>Identification</span>
                </Box>
                <Box className="add-person-form__row">
                    <TextField
                        label="CNP"
                        value={addPerson.cnp}
                        onChange={(e) => setAddPerson({ ...addPerson, cnp: e.target.value })}
                        fullWidth
                        size="small"
                        inputProps={{ maxLength: 13 }}
                        helperText="13-digit personal identification number"
                    />
                    <TextField
                        label="Date of birth"
                        type="date"
                        value={addPerson.dateOfBirth}
                        onChange={(e) => setAddPerson({ ...addPerson, dateOfBirth: e.target.value })}
                        fullWidth
                        size="small"
                        InputLabelProps={{ shrink: true }}
                    />
                </Box>
            </Box>

            <Box>
                <Box className="add-person-form__section-header">
                    <FavoriteBorderIcon />
                    <span>Relationship</span>
                </Box>
                <TextField
                    label="Relationship"
                    value={addPerson.relationship}
                    onChange={(e) => setAddPerson({ ...addPerson, relationship: Number(e.target.value) })}
                    fullWidth
                    required
                    size="small"
                    select
                >
                    {}
                    <MenuItem value={RelationshipType.Parent}>Parent (mother / father)</MenuItem>
                    <MenuItem value={RelationshipType.Child}>Child (son / daughter)</MenuItem>
                    <MenuItem value={RelationshipType.Partner}>Spouse / Partner</MenuItem>
                    <MenuItem value={RelationshipType.Grandparent}>Grandparent</MenuItem>
                    <MenuItem value={RelationshipType.Other}>Other</MenuItem>
                </TextField>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button
                    onClick={addPersonMethod}
                    autoFocus
                    disabled={!isFormValid()}
                    variant="contained"
                    sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        padding: 0.9,
                        backgroundImage: !isFormValid()
                            ? 'linear-gradient(to bottom, #bdbdbd, #757575)'
                            : 'linear-gradient(to bottom, hsl(220, 20%, 25%), hsl(220, 30%, 6%))',
                        border: !isFormValid()
                            ? '1px solid #9e9e9e'
                            : '1px solid hsl(220, 20%, 25%)',
                        boxShadow: !isFormValid()
                            ? 'none'
                            : 'inset 0 1px 0 hsl(220, 20%, 35%), inset 0 -1px 0 1px hsl(220, 0%, 0%)',
                        '&:hover': {
                            backgroundImage: !isFormValid()
                                ? 'linear-gradient(to bottom, #bdbdbd, #757575)'
                                : 'linear-gradient(to bottom, hsl(220, 25%, 30%), hsl(220, 30%, 10%))',
                            cursor: !isFormValid() ? 'not-allowed' : 'pointer',
                        },
                        opacity: !isFormValid() ? 0.7 : 1,

                    }}>
                {"Add person"}
            </Button>
        </Box>
        </Box>

    );
};

export default AddPersonForm;