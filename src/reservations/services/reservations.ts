import { useFrontendPagination } from "@/base/services/api";
import { Reservation } from "@/reservations/models/reservation";
import { APIResponse, usePrivateAPI } from "@/base/services/api";
import { AxiosInstance } from "axios";
import { useMemo } from "react";
import { CreateReservationForm, CreateSaleForm } from "../models/forms";

class ReservationService {
    constructor(private privateAPI: AxiosInstance) { }

    async createReservation(data: CreateReservationForm) {
        const response = await this.privateAPI.post<APIResponse<Response>>(
            '/agency/reservations/',
            data
        );
        return response.data;
    }

    async createSale(data: CreateSaleForm) {
        const response = await this.privateAPI.post<APIResponse<Response>>(
            '/agency/sales/',
            data
        );
        return response.data;
    }
}

export function useReservationService() {
    const privateAPI = usePrivateAPI();
    const service = useMemo(() => new ReservationService(privateAPI), [privateAPI]);
    return service;
}

export function usePaginatedReservation() {
    return useFrontendPagination<Reservation>({
        url: '/agency/reservations/',
        pageSize: 10,
    });
}
