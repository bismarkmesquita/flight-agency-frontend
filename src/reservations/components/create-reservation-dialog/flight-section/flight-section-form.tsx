import { Autocomplete, Button, Chip, Divider, TextField } from "@mui/material";
import style from "../create-reservation-dialog.module.scss";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useFlightsContext } from "@/flights/providers/flights-context";
import { AirlineInput, ArrivalAirportInput, DepartureAirportInput, FlightNumberInput } from "./flight-inputs";
import { DateInput } from "@/base/components/date-input/date-input";
import { useForm } from "react-hook-form";
import { useReservationStepperContext } from "@/reservations/providers/reservation-stepper-context";
import { useSnackbar } from "@/base/context/SnackbarContext";
import { FlightForm } from "@/flights/models/forms";
import { useFlightService } from "@/flights/services/flights";
import { Airline } from "@/flights/models/airline";
import { Airport } from "@/flights/models/airport";
import { Flight } from "@/flights/models/flight";

export default function FlightSectionForm() {
    const { showSnackbar } = useSnackbar();
    const { handleNext, selectedFlights, setSelectedFlights } = useReservationStepperContext();
    const { flights, createFlight } = useFlightsContext();

    const flightService = useFlightService();
    const [airlines, setAirlines] = useState<Airline[]>([]);
    const [airports, setAirports] = useState<Airport[]>([]);
    const [selectedFlightOption, setSelectedFlightOption] = useState<Flight | null>(null);

    useEffect(() => {
        fetchAirlines();
        fetchAirports();
    }, []);

    const fetchAirlines = async () => {
        const response = await flightService.fetchAirlines();
        if (response.success) {
            setAirlines(response.airlines);
        }
    };

    const fetchAirports = async () => {
        const response = await flightService.fetchAirports();
        if (response.success) {
            setAirports(response.airports);
        }
    };

    const {
        control: flightControl,
        formState: { errors: flightErrors },
        getValues,
        trigger,
        reset,
    } = useForm<FlightForm>({
        defaultValues: {
            departure_date: new Date(),
            arrival_date: new Date(),
        },
    });

    const handleSelectFlight = (flight: Flight | null) => {
        if (!flight) {
            return;
        }

        const alreadySelected = selectedFlights.some(
            (selectedFlight) => selectedFlight.id === flight.id
        );

        if (alreadySelected) {
            showSnackbar(
                "This flight has already been selected.",
                "warning"
            );
            return;
        }

        setSelectedFlights([
            ...selectedFlights,
            flight,
        ]);
    };

    const handleRemoveFlight = (flightId: number) => {
        setSelectedFlights(
            selectedFlights.filter(
                (flight) => flight.id !== flightId
            )
        );
    };

    const handleCreateFlight = async () => {
        const valid = await trigger();

        if (!valid) {
            return;
        }

        const formValues = getValues();

        const response = await createFlight(formValues);

        if (!response.success) {
            showSnackbar(response.message, "error");
            return;
        }

        const createdFlight = response.flight;

        setSelectedFlights([
            ...selectedFlights,
            createdFlight,
        ]);

        reset({
            departure_date: new Date(),
            arrival_date: new Date(),
        });

        showSnackbar(
            "Flight successfully added.",
            "success"
        );
    };

    const handleNextStep = () => {
        if (selectedFlights.length === 0) {
            showSnackbar(
                "Select or register at least one flight.",
                "error"
            );

            return;
        }

        handleNext();
    };

    return (
        <div className={style.flight}>
            <div className={style.section}>
                {selectedFlights.length > 0 && (
                    <div className={style.selectedFlights}>
                        <div className={style.chips}>
                            {selectedFlights.map((flight) => (
                                <Chip
                                    key={flight.id}
                                    label={`${flight.iata} - ${flight.departure_airport.iata} → ${flight.arrival_airport.iata}`}
                                    onDelete={() =>
                                        handleRemoveFlight(flight.id)
                                    }
                                />
                            ))}
                        </div>
                    </div>
                )}

                <Divider>
                    <Chip
                        label="Select Flights"
                        variant="outlined"
                        size="small"
                    />
                </Divider>

                <div className={style.search}>
                    <div className={style.dropdown}>
                        <Autocomplete
                            fullWidth
                            value={selectedFlightOption}
                            options={flights}
                            getOptionLabel={(option) => {
                                if (!option) {
                                    return "";
                                }

                                return `${option.iata} (${option.departure_airport.iata} → ${option.arrival_airport.iata} - ${format(
                                    new Date(option.departure_date),
                                    "dd/MM/yyyy - HH:mm"
                                )})`;
                            }}
                            onChange={(_, newValue) => {
                                if (newValue) {
                                    handleSelectFlight(newValue);
                                    setSelectedFlightOption(null);
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    size="small"
                                    label="Search flight"
                                    variant="outlined"
                                />
                            )}
                        />
                    </div>
                </div>
            </div>

            <div className={style.section}>
                <Divider>
                    <Chip
                        label="Register New Flight"
                        variant="outlined"
                        size="small"
                    />
                </Divider>

                <div className={style.inputs}>
                    <div className={style.couple}>
                        <FlightNumberInput
                            control={flightControl}
                            errors={flightErrors}
                        />

                        <AirlineInput
                            control={flightControl}
                            errors={flightErrors}
                            airlines={airlines}
                        />
                    </div>

                    <div className={style.couple}>
                        <DepartureAirportInput
                            control={flightControl}
                            errors={flightErrors}
                            airports={airports}
                        />

                        <ArrivalAirportInput
                            control={flightControl}
                            errors={flightErrors}
                            airports={airports}
                        />
                    </div>

                    <div className={style.couple}>
                        <DateInput<FlightForm>
                            control={flightControl}
                            errors={flightErrors}
                            name="departure_date"
                            label="Departure date"
                        />

                        <DateInput<FlightForm>
                            control={flightControl}
                            errors={flightErrors}
                            name="arrival_date"
                            label="Arrival date"
                        />
                    </div>

                    <div className={style.actions}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={handleCreateFlight}
                        >
                            Add Flight
                        </Button>
                    </div>
                </div>
            </div>

            <div className={style.actions}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNextStep}
                    disabled={selectedFlights.length === 0}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}