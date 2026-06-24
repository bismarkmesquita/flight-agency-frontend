import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Step,
    StepLabel,
    Stepper,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import style from "./create-reservation-dialog.module.scss";
import FlightSectionForm from "./flight-section/flight-section-form";
import { useReservationStepperContext } from "@/reservations/providers/reservation-stepper-context";
import CustomerSectionForm from "./customer-section/customer-section-form";
import ReservationSectionForm from "./reservation-section/reservation-section-form";
import ConfirmReservationSection from "./confirm-section/confirm-section";

type Props = {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
};

export default function CreateReservationStepperDialog({
    open,
    onClose,
    onSuccess
}: Props) {
    const { steps, activeStep } = useReservationStepperContext();

    return (
        <Dialog className={style.root} open={open} fullWidth maxWidth="md">
            <DialogTitle className={style.title}>
                Create Reservation
                <IconButton
                    color="primary"
                    onClick={onClose}
                >
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <div className={style.stepper}>
                    <Stepper activeStep={activeStep} alternativeLabel>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    {activeStep === 0 && <FlightSectionForm />}
                    {activeStep === 1 && <CustomerSectionForm />}
                    {activeStep === 2 && <ReservationSectionForm />}
                    {activeStep === 3 && <ConfirmReservationSection onSuccess={onSuccess} />}
                </div>
            </DialogContent>
        </Dialog>
    );
}
