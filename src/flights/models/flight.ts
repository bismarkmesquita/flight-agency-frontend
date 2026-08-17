import { Airline } from "./airline";
import { Airport } from "./airport";

export interface FlightReservation {
    locator: string;
    name: string;
    phone: string;
}

export interface Flight {
    id: number;
    iata: string;
    airline: Airline;
    departure_date: string;
    departure_airport: Airport;
    arrival_date: string;
    arrival_airport: Airport;
    reservations: FlightReservation[]
}
