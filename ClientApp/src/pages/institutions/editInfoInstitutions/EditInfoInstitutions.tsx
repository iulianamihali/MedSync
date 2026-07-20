import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import {MenuItem, TextField} from "@mui/material";
import type EditInfoInstitutionsEntity from "../../../models/EditInfoInstitutionsEntity";

const FormGrid = styled(Grid)(() => ({
    display: 'flex',
    flexDirection: 'column',
}));

export type Props = {
    editInfoInstitutionsEntity: EditInfoInstitutionsEntity;
    setEditInfoInstitutionsEntity: (editInfoInstitutions: EditInfoInstitutionsEntity) => void;
}

export default function EditInfoInstitutions(props: Props) {
    return (
        <Grid container spacing={3}>
            <FormGrid size={{ xs: 6 }}>
                <TextField
                    id="institution-name"
                    value={props.editInfoInstitutionsEntity.institutionName}
                    onChange={(e) => props.setEditInfoInstitutionsEntity({...props.editInfoInstitutionsEntity, institutionName: e.target.value})}
                    name="institutionName"
                    label="Institution name"
                    variant="standard"
                    required
                    fullWidth
                    autoComplete="organization"
                />
            </FormGrid>

            <FormGrid size={{ xs: 6 }}>
                <TextField
                    id="country"
                    value={props.editInfoInstitutionsEntity.country}
                    onChange={(e) => props.setEditInfoInstitutionsEntity({...props.editInfoInstitutionsEntity, country: e.target.value})}
                    name="country"
                    label="Country"
                    variant="standard"
                    required
                    fullWidth
                    autoComplete="country"
                />
            </FormGrid>

            <FormGrid size={{ xs: 6 }}>
                <TextField
                    id="city"
                    value={props.editInfoInstitutionsEntity.city}
                    onChange={(e) => props.setEditInfoInstitutionsEntity({...props.editInfoInstitutionsEntity, city: e.target.value})}
                    name="city"
                    label="City"
                    variant="standard"
                    required
                    fullWidth
                    autoComplete="address-level2"
                />
            </FormGrid>

            <FormGrid size={{ xs: 6 }}>
                <TextField
                    id="Street"
                    value={props.editInfoInstitutionsEntity.streetAddress}
                    onChange={(e) => props.setEditInfoInstitutionsEntity({...props.editInfoInstitutionsEntity, streetAddress: e.target.value})}
                    name="street"
                    label="Street Address"
                    variant="standard"
                    required
                    fullWidth
                    autoComplete="street-address"
                />
            </FormGrid>

            <FormGrid size={{ xs: 6 }}>
                <TextField
                    id="streetNumber"
                    value={props.editInfoInstitutionsEntity.streetNumber}
                    onChange={(e) => props.setEditInfoInstitutionsEntity({...props.editInfoInstitutionsEntity, streetNumber: e.target.value})}
                    name="streetNumber"
                    label="Street Number"
                    variant="standard"
                    required
                    fullWidth
                />
            </FormGrid>

            <FormGrid size={{ xs: 6 }}>
                <TextField
                    id="postalCode"
                    value={props.editInfoInstitutionsEntity.postalCode}
                    onChange={(e) => props.setEditInfoInstitutionsEntity({...props.editInfoInstitutionsEntity, postalCode: e.target.value})}
                    name="postalCode"
                    label="Zip / Postal code"
                    variant="standard"
                    required
                    fullWidth
                    autoComplete="postal-code"
                />
            </FormGrid>

            <FormGrid size={{ xs: 6 }}>
                <TextField
                    select
                    id="status"
                    name="status"
                    label="Status"
                    variant="standard"
                    required
                    fullWidth
                    value={props.editInfoInstitutionsEntity.status ? "active" : "inactive"}
                    onChange={(e) =>
                        props.setEditInfoInstitutionsEntity({
                            ...props.editInfoInstitutionsEntity,
                            status: e.target.value === "active"
                        })
                    }
                    SelectProps={{
                        sx: {
                            color: props.editInfoInstitutionsEntity.status ? "green" : "red",
                        }
                    }}
                >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>

            </FormGrid>


        </Grid>
    );
}