"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useFlightService } from "../services/flights";
import { Flight } from "../models/flight";
import { FlightForm } from "../models/forms";

interface FlightsContextType {
    flights: Flight[];
    createFlight: (data: FlightForm) => Promise<any>;
}

const FlightsContext = createContext<FlightsContextType | null>(null);

export function FlightsProvider({ children }: { children: ReactNode }) {
    const flightService = useFlightService();
    const [flights, setFlights] = useState<Flight[]>([]);

    useEffect(() => {
        fetchFlights();
    }, [])

    const fetchFlights = async () => {
        const response = await flightService.fetchFlights();
        if (response.success) {
            setFlights(response.flights);
        } else {
            console.error(response.message)
        }
    }

    const createFlight = async (data: FlightForm) => {
        const response = await flightService.createFlight(data);

        if (response.success) {
            setFlights(prev => [...prev, response.flight]);
        }

        return response;
    };

    return (
        <FlightsContext.Provider
            value={{
                flights,
                createFlight
            }}
        >
            {children}
        </FlightsContext.Provider>
    )
}

export const useFlightsContext = () => {
    const context = useContext(FlightsContext);
    if (!context) {
        throw new Error(
            'useFlightsContext must be used within a FlightsProvider'
        );
    }
    return context;
};
