import { AxiosInstance } from "axios";
import { APIResponse, usePrivateAPI } from "@/base/services/api";
import { useMemo } from "react";
import { Flight } from "../models/flight";
import { Airline } from "../models/airline";
import { FlightForm } from "../models/forms";
import { Airport } from "../models/airport";

class FlightService {
    constructor(private privateAPI: AxiosInstance) { }

    async fetchAirlines() {
        interface Response {
            airlines: Airline[];
        }
        const response = await this.privateAPI.get<APIResponse<Response>>('/flights/airlines/');
        return response.data;
    }

    async fetchAirports() {
        interface Response {
            airports: Airport[];
        }
        const response = await this.privateAPI.get<APIResponse<Response>>('/flights/airports/');
        return response.data;
    }

    async fetchFlights() {
        interface Response {
            flights: Flight[];
        }
        const response = await this.privateAPI.get<APIResponse<Response>>('/flights/next/');
        return response.data;
    }

    async createFlight(data: FlightForm) {
        interface Response {
            flight: Flight;
        }
        const payload = {
            ...data,
            arrival_date: data.arrival_date.toISOString(),
            departure_date: data.departure_date.toISOString(),
        };
        const response = await this.privateAPI.post<APIResponse<Response>>(
            '/flights/',
            payload
        );
        return response.data;
    }
}

export function useFlightService() {
    const privateAPI = usePrivateAPI();
    const service = useMemo(() => new FlightService(privateAPI), [privateAPI]);
    return service;
}