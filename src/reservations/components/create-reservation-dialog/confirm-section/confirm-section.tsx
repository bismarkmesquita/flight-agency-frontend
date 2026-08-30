import { Button, Divider } from "@mui/material";
import style from "../create-reservation-dialog.module.scss";
import { useReservationStepperContext } from "@/reservations/providers/reservation-stepper-context";
import { useReservationService } from "@/reservations/services/reservations";
import { useSnackbar } from "@/base/context/SnackbarContext";
import { format } from "date-fns";
import { useManagementContext } from "@/management/providers/management-context";
import { useIsMobile } from "@/base/styles/hooks";
import { PAYMENT_METHOD_LABELS, SALE_TYPE_LABELS } from "@/reservations/models/sale";

type Props = {
    onSuccess: () => void;
};

export default function ConfirmReservationSection({ onSuccess }: Props) {
    const {
        selectedFlights,
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

    const supplier = reservationData
        ? suppliers.find((s) => s.id === reservationData.supplier_id)
        : undefined;

    const issuer = reservationData
        ? users.find((u) => u.id === reservationData.issuer_id)
        : undefined;

    const seller = saleData
        ? users.find((u) => u.id === saleData.seller_id)
        : undefined;

    const handleCreateReservation = async () => {
        if (
            selectedFlights.length === 0 ||
            !selectedCustomer ||
            !reservationData ||
            !saleData
        ) {
            return
        };

        const response = await reservationService.createReservation(
            { ...saleData, customer_id: selectedCustomer.id },
            { ...reservationData, flight_ids: selectedFlights.map((flight) => flight.id) },
        );

        if (!response.success) {
            showSnackbar(
                response.message ?? "An unexpected error occurred.",
                "error"
            );
            return;
        }

        resetReservationStepper();
        onSuccess();

        showSnackbar("Reservation successfully added.", "success");
    };

    return (
        <div className={style.stepper}>
            <div className={style.confirm}>

                {/* Flights */}
                <div className={style.confirmSection}>
                    <h3>Flights</h3>

                    {selectedFlights.map((flight) => (
                        <div key={flight.id}>
                            <p><b>Flight:</b>{" "}{flight.iata}</p>
                            <p><b>From:</b>{" "}{flight.departure_airport.iata}</p>
                            <p><b>To:</b>{" "}{flight.arrival_airport.iata}</p>
                            <p>
                                <b>Departure:</b>{" "}
                                {format(
                                    new Date(flight.departure_date),
                                    "dd/MM/yyyy HH:mm"
                                )}
                            </p>
                            <p>
                                <b>Arrival:</b>{" "}
                                {format(
                                    new Date(flight.arrival_date),
                                    "dd/MM/yyyy HH:mm"
                                )}
                            </p>

                            {selectedFlights.length > 1 && (
                                <Divider sx={{ my: 1 }} />
                            )}
                        </div>
                    ))}
                </div>

                <Divider flexItem orientation={isMobile ? "horizontal" : "vertical"} />

                {/* Customer */}
                {selectedCustomer && <div className={style.confirmSection}>
                    <h3>Customer</h3>
                    <p><b>Name:</b>{" "}{selectedCustomer.name}</p>
                    <p><b>Email:</b>{" "}{selectedCustomer.email}</p>
                    <p><b>Phone:</b>{" "}{selectedCustomer.phone}</p>
                </div>}

                <Divider flexItem orientation={isMobile ? "horizontal" : "vertical"} />

                {/* Sale */}
                {saleData && <div className={style.confirmSection}>
                    <h3>Sale</h3>
                    <p><b>Seller(a):</b>{" "}{seller?.name}</p>
                    <p><b>Type:</b>{" "}{" "}{SALE_TYPE_LABELS[saleData.type]}</p>
                    <p><b>Indication:</b>{" "}{saleData.indication}</p>
                    <p><b>Payment:</b>{" "}{PAYMENT_METHOD_LABELS[saleData.payment]}</p>
                    <p><b>Amount Received:</b>{" "}R$ {saleData.amount_received}</p>
                    <p><b>Cost:</b>{" "}R$ {saleData.cost}</p>
                    <p><b>Sale Date:</b>{" "}{format(saleData.sale_date, "dd/MM/yyyy")}</p>
                </div>}

                <Divider flexItem orientation={isMobile ? "horizontal" : "vertical"} />

                {/* Reservation */}
                {reservationData && <div className={style.confirmSection}>
                    <h3>Reservation</h3>
                    <p><b>Locator:</b>{" "}{reservationData.locator}</p>
                    <p><b>Passenger Count:</b>{" "}{reservationData.passenger_count}</p>
                    <p><b>Passengers:</b>{" "}{reservationData.passengers}</p>
                    <p><b>Supplier:</b>{" "}{supplier?.name}</p>
                    <p><b>Issuer(a):</b>{" "}{issuer?.name}</p>
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
                    disabled={
                        selectedFlights.length === 0 ||
                        !selectedCustomer ||
                        !reservationData ||
                        !saleData
                    }
                >
                    Confirm
                </Button>
            </div>
        </div>
    )
}
