import { Button, Divider } from "@mui/material";
import style from "../create-reservation-dialog.module.scss";
import { useReservationStepperContext } from "@/reservations/providers/reservation-stepper-context";
import { useReservationService } from "@/reservations/services/reservations";
import { useSnackbar } from "@/base/context/SnackbarContext";
import { format } from "date-fns";
import { useManagementContext } from "@/management/providers/management-context";
import { useIsMobile } from "@/base/styles/hooks";
import { PAYMENT_METHOD_LABELS } from "@/reservations/models/sale";

type Props = {
    onSuccess: () => void;
};

export default function ConfirmReservationSection({ onSuccess }: Props) {
    const {
        selectedFlight,
        selectedCustomer,
        reservationData,
        saleData,
        handleBack,
        resetReservationStepper
    } = useReservationStepperContext();

    const reservationService = useReservationService();
    const { users, suppliers } = useManagementContext();
    const { showSnackbar } = useSnackbar();
    const isMobile = useIsMobile();

    let supplier, seller, issuer;
    if (reservationData) {
        supplier = suppliers.find(s => s.id === reservationData.supplier_id);
        issuer = users.find(u => u.id === reservationData.issuer_id);
    }
    if (saleData) {
        seller = users.find(u => u.id === saleData.seller_id);
    }

    const handleCreateReservation = async () => {
        if (!selectedFlight || !selectedCustomer || !reservationData) return;

        const response = await reservationService.createReservation({
            ...reservationData,
            flight_ids: [selectedFlight.id],
        });

        if (!response.success) {
            showSnackbar(response.message ?? "An unexpected error occurred.", "error");
            return;
        }

        resetReservationStepper();
        onSuccess();
        showSnackbar("Reservation successfully added.", "success");
    };

    return (
        <div className={style.stepper}>
            <div className={style.confirm}>
                {selectedFlight && <div className={style.confirmSection}>
                    <h4>Voo</h4>
                    <p><b>Flight Number:</b>{selectedFlight.flight_number}</p>
                    <p><b>From:</b>{selectedFlight.departure_airport.name}</p>
                    <p><b>To:</b>{selectedFlight.arrival_airport.name}</p>
                    <p><b>Departure:</b>{format(selectedFlight.departure_date, "dd/mm/yyyy HH:mm")}</p>
                    <p><b>Arrival:</b>{format(selectedFlight.arrival_date, "dd/mm/yyyy HH:mm")}</p>
                </div>}
                <Divider flexItem orientation={isMobile ? "horizontal" : "vertical"} />
                {selectedCustomer && <div className={style.confirmSection}>
                    <h4>Customer</h4>
                    <p><b>Name:</b>{selectedCustomer.name}</p>
                    <p><b>Email:</b>{selectedCustomer.email}</p>
                    <p><b>Phone:</b>{selectedCustomer.phone}</p>
                </div>}
                <Divider flexItem orientation={isMobile ? "horizontal" : "vertical"} />
                {reservationData && <div className={style.confirmSection}>
                    <h4>Reservation</h4>
                    <p><b>Locator:</b> {reservationData.locator}</p>
                    <p><b>Passenger Count:</b> {reservationData.passenger_count}</p>
                    <p><b>Passengers:</b> {reservationData.passengers}</p>
                    <p><b>Supplier:</b> {supplier?.name}</p>
                    <p><b>Issuer(a):</b> {issuer?.name}</p>
                </div>}
                {saleData && <div className={style.confirmSection}>
                    <h4>Sale</h4>
                    <p><b>Seller(a):</b> {seller?.name}</p>
                    <p><b>Indication:</b> {saleData.indication}</p>
                    <p><b>Payment:</b> {PAYMENT_METHOD_LABELS[saleData.payment]}</p>
                    <p><b>Amount Received:</b> R$ {saleData.amount_received}</p>
                    <p><b>Cost:</b> R$ {saleData.cost}</p>
                    <p><b>Sale Date:</b> {format(saleData.sale_date, "dd/MM/yyyy")}</p>
                </div>}
            </div>
            <div className={style.actions}>
                <Button onClick={handleBack} variant="outlined">
                    Back
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCreateReservation}
                >
                    Confirm
                </Button>
            </div>
        </div>
    )
}
