import { Button } from "@mui/material";
import style from "../create-reservation-dialog.module.scss";
import { CreateReservationForm, CreateSaleForm } from "@/reservations/models/forms";
import { useForm } from "react-hook-form";
import { useReservationStepperContext } from "@/reservations/providers/reservation-stepper-context";
import { IssuerInput, LocatorInput, PassengersInput, SupplierInput } from "./reservation-inputs";
import { useManagementContext } from "@/management/providers/management-context";
import { useEffect } from "react";
import { IndicationInput } from "../sale-section/sale-inputs";

export default function ReservationSectionForm() {
    const { handleBack } = useReservationStepperContext();
    const { users, suppliers } = useManagementContext();
    const {
        selectedFlight,
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

    // const {
    //     control: saleControl,
    //     formState: { errors: saleErrors },
    //     getValues,
    //     setValue,
    //     trigger,
    // } = useForm<CreateSaleForm>({});

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
        if (!valid || !selectedFlight || !selectedCustomer) {
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
                <div className={style.couple}>
                    <LocatorInput
                        control={reservationControl}
                        errors={reservationErrors}
                    />
                    {/* <IndicationInput
                        control={reservationControl}
                        errors={reservationErrors}
                    /> */}
                </div>
                <div className={style.couple}>
                    <PassengersInput
                        control={reservationControl}
                        errors={reservationErrors}
                    />
                    {/* <QTDPaxInput
                        control={reservationControl}
                        errors={reservationErrors}
                    /> */}

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
                <div className={style.couple}>
                    {/* <SellerInput
                        control={reservationControl}
                        errors={reservationErrors}
                        sellers={users}
                    />
                    <PaymentInput
                        control={reservationControl}
                        errors={reservationErrors}
                    /> */}
                </div>
                <div className={style.couple}>
                    {/* <ReceivedInput
                        control={reservationControl}
                        errors={reservationErrors}
                    />
                    <CostInput
                        control={reservationControl}
                        errors={reservationErrors}
                    /> */}
                </div>
                {/* <DateSaleInput
                    control={reservationControl}
                    errors={reservationErrors}
                /> */}
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
                    Register reservation
                </Button>
            </div>
        </div>
    )
}
