import { Autocomplete, Button, Chip, Divider, TextField } from "@mui/material";
import style from "../create-reservation-dialog.module.scss";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useFlightsContext } from "@/flights/providers/flights-context";
import { AirlineInput, ArrivalAirportInput, DepartureAirportInput, FlightIataInput } from "./flight-inputs";
import { DateInput } from "@/base/components/date-input/date-input";
import { useForm } from "react-hook-form";
import { useReservationStepperContext } from "@/reservations/providers/reservation-stepper-context";
import { useSnackbar } from "@/base/context/SnackbarContext";
import { FlightForm } from "@/flights/models/forms";
import { useFlightService } from "@/flights/services/flights";
import { Airline } from "@/flights/models/airline";
import { Airport } from "@/flights/models/airport";

export default function FlightSectionForm() {
    const { showSnackbar } = useSnackbar();
    const { handleNext, selectedFlight, setSelectedFlight } = useReservationStepperContext();
    const { flights, createFlight } = useFlightsContext();

    const flightService = useFlightService();
    const [airlines, setAirlines] = useState<Airline[]>([]);
    const [airports, setAirports] = useState<Airport[]>([]);

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
        setValue,
        getValues,
        trigger,
    } = useForm<FlightForm>({
        defaultValues: {
            departure_date: new Date(),
            arrival_date: new Date(),
        },
    });

    useEffect(() => {
        if (!selectedFlight) return;

        setValue("flight_number", selectedFlight.flight_number.toString());
        setValue("airline_id", selectedFlight.airline.id);
        setValue("departure_airport_id", selectedFlight.departure_airport.id);
        setValue("arrival_airport_id", selectedFlight.arrival_airport.id);
        setValue("departure_date", new Date(selectedFlight.departure_date));
        setValue("arrival_date", new Date(selectedFlight.arrival_date));
    }, [selectedFlight]);

    const handleCreateFlightOrNext = async () => {
        if (selectedFlight) {
            handleNext();
            return;
        }

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
        setSelectedFlight(createdFlight);

        handleNext();
        showSnackbar("Flight successfully added.", "success");
    }

    return (
        <div className={style.flight}>
            <h3>Buscar Voo</h3>
            <div className={style.search}>
                <div className={style.dropdown}>
                    <Autocomplete
                        fullWidth
                        options={flights}
                        getOptionLabel={(option) => {
                            if (!option) return "";
                            return `${option.flight_number} (
                            ${option.departure_airport} -
                            ${format(option.departure_date, "dd/MM/yyyy - HH:mm")}
                            )`;
                        }}
                        onChange={(event, newValue) => {
                            setSelectedFlight(newValue ?? null);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="small"
                                label="Flight"
                                variant="outlined"
                            />
                        )}
                    />
                </div>
            </div>
            <Divider>
                <Chip label="Flight Data" variant="outlined" size="small" />
            </Divider>
            <div className={style.inputs}>
                <div className={style.couple}>
                    <FlightIataInput
                        control={flightControl}
                        errors={flightErrors}
                        disabled={!!selectedFlight}
                    />
                    <AirlineInput
                        control={flightControl}
                        errors={flightErrors}
                        airlines={airlines}
                        disabled={!!selectedFlight}
                    />
                </div>
                <div className={style.couple}>
                    <DepartureAirportInput
                        control={flightControl}
                        errors={flightErrors}
                        airports={airports}
                        disabled={!!selectedFlight}
                    />
                    <ArrivalAirportInput
                        control={flightControl}
                        errors={flightErrors}
                        airports={airports}
                        disabled={!!selectedFlight}
                    />
                </div>
                <div className={style.couple}>
                    <DateInput<FlightForm>
                        control={flightControl}
                        errors={flightErrors}
                        name="departure_date"
                        label="Departure date"
                        disabled={!!selectedFlight}
                    />
                    <DateInput<FlightForm>
                        control={flightControl}
                        errors={flightErrors}
                        name="arrival_date"
                        label="Arrival Date"
                        disabled={!!selectedFlight}
                    />
                </div>
                <div className={style.actions}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCreateFlightOrNext}
                    >
                        {selectedFlight ? "Next" : "Register flight"}
                    </Button>
                </div>
            </div>
        </div>
    )
}