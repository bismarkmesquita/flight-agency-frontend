import { Button } from "@mui/material";
import style from "../create-reservation-dialog.module.scss";
import { CreateReservationForm } from "@/reservations/models/forms";
import { useForm } from "react-hook-form";
import { useReservationStepperContext } from "@/reservations/providers/reservation-stepper-context";
import {
    IssuerInput,
    LocatorInput,
    PassengerCountInput,
    PassengersInput,
    SupplierInput
} from "./reservation-inputs";
import { useManagementContext } from "@/management/providers/management-context";
import { useEffect } from "react";

export default function ReservationSectionForm() {
    const { handleBack } = useReservationStepperContext();
    const { users, suppliers } = useManagementContext();
    const {
        selectedFlights,
        selectedCustomer,
        reservationData,
        setReservationData,
        handleNext
    } = useReservationStepperContext();

    const {
        control: reservationControl,
        formState: { errors: reservationErrors },
        getValues,
        setValue,
        trigger,
    } = useForm<CreateReservationForm>({});

    useEffect(() => {
        if (!reservationData) return;

        setValue("locator", reservationData.locator);
        setValue("flight_ids", reservationData.flight_ids);
        setValue("passengers", reservationData.passengers ?? "");
        setValue("supplier_id", reservationData.supplier_id);
        setValue("issuer_id", reservationData.issuer_id);
        setValue("passenger_count", reservationData.passenger_count);
    }, [reservationData]);

    const handleConfirmAndNext = async () => {
        const valid = await trigger();
        if (!valid || !selectedFlights || !selectedCustomer) {
            return;
        }

        const formValues = getValues();
        setReservationData(formValues);

        handleNext();
    }

    return (
        <div className={style.reservation}>
            <h3>Reservation Details</h3>
            <div className={style.inputs}>
                <LocatorInput
                    control={reservationControl}
                    errors={reservationErrors}
                />
                <div className={style.couple}>
                    <PassengersInput
                        control={reservationControl}
                        errors={reservationErrors}
                    />
                    <PassengerCountInput
                        control={reservationControl}
                        errors={reservationErrors}
                    />
                </div>
                <div className={style.couple}>
                    <IssuerInput
                        control={reservationControl}
                        errors={reservationErrors}
                        issuers={users} />
                    <SupplierInput
                        control={reservationControl}
                        errors={reservationErrors}
                        suppliers={suppliers} />
                </div>
            </div>
            <div className={style.actions}>
                <Button onClick={handleBack} variant="outlined">
                    Back
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleConfirmAndNext}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
