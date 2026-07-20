import React from "react";
import Button from '@mui/material/Button';
import {styled} from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    title: string;
    dataComponent?: Record<string, unknown>; // props for content component
    contentComponent: React.ComponentType<Record<string, unknown> & { onSuccess?: () => void }>;
    showActions: boolean;
    onClickCallback?: () => void;
    textButton?: string;
    width?: string;
    disableActionButton?: boolean;
}

const BootstrapDialog = styled(Dialog)(({theme}) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export default function CustomPopUp(props: Props) {

    const handleClose = () => {
        props.setOpen(false);
    };

    return (
        <BootstrapDialog
            aria-labelledby="customized-dialog-title"
            open={props.open}
            fullWidth
            maxWidth={false}
            onClose={(_, reason) => {
                if (reason === 'backdropClick') return;
                handleClose();
            }}
            PaperProps={{
                sx: {
                    width:
                        {
                            xs: '95vw',
                            sm: '90vw',
                            // md: props.width ?? '71vw',
                            lg: props.width ?? '71vw'
                        },
                    maxWidth: '1200px',
                },
            }}
        >
            <DialogTitle sx={{m: 0, p: 2}} id="customized-dialog-title">
                {props.title}
            </DialogTitle>
            <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={(theme) => ({
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: theme.palette.grey[500],
                })}
            >
                <CloseIcon/>
            </IconButton>
            <DialogContent dividers>
                <props.contentComponent
                    {...props.dataComponent}
                    onSuccess={() => {
                        handleClose();
                        if(props.onClickCallback)
                            props?.onClickCallback();
                    }}
                />
            </DialogContent>
            {props.showActions && (
                <DialogActions>
                    <Button autoFocus
                            disableRipple
                            disabled={props.disableActionButton}
                            onClick={() => {
                                if (props.onClickCallback)
                                    props.onClickCallback();
                                handleClose();
                            }}
                            variant="contained"
                            sx={{
                                textTransform: 'none',
                                borderRadius: 2,
                                padding: 0.9,
                                transition: 'none',
                                backgroundImage: 'linear-gradient(to bottom, hsl(220, 20%, 25%), hsl(220, 30%, 6%))',
                                border: '1px solid hsl(220, 20%, 25%)',
                                boxShadow: 'inset 0 1px 0 hsl(220, 20%, 35%), inset 0 -1px 0 1px hsl(220, 0%, 0%)',
                                '&:hover': {
                                    backgroundImage: 'linear-gradient(to bottom, hsl(220, 25%, 30%), hsl(220, 30%, 10%))',
                                },
                                '&.Mui-disabled': {
                                    color: '#9e9e9e',
                                    background: '#eeeeee',
                                    border: '1px solid #d0d0d0',
                                    boxShadow: 'none',
                                },
                                '&.Mui-disabled:hover': {
                                    color: '#9e9e9e',
                                    background: '#eeeeee',
                                    border: '1px solid #d0d0d0',
                                    boxShadow: 'none',
                                },
                            }}>
                        {props.textButton}
                    </Button>

                </DialogActions>
            )}
        </BootstrapDialog>
    );
}
