import {Avatar, Chip, Typography} from "@mui/material";
import {Box} from "@mui/system";

type Props = {
    firstName: string,
    lastName: string,
    age: number,
}

const PatientHeader = (props: Props) => {
    return(
        <Box
            display="flex"
            alignItems="center"
            gap={2}
            sx={{marginLeft: 2, padding: 2, marginTop: 2 }}
        >
        <Avatar>{props.firstName[0]}{props.lastName[0]}</Avatar>

        <Box>
            <Typography variant="h6" fontWeight="600">
                {props.firstName} {props.lastName}
            </Typography>

            <Typography variant="body2" color="text.secondary">
                {props.age} years
            </Typography>
        </Box>
        </Box>
    );

}

export default PatientHeader;