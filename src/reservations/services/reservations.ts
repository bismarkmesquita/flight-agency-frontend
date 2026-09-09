import { useMemo } from "react";
import { AxiosInstance } from "axios";
import { useFrontendPagination } from "@/base/services/api";
import { APIResponse, usePrivateAPI } from "@/base/services/api";
import { Reservation } from "@/reservations/models/reservation";
import { CreateReservationForm, CreateSaleForm } from "../models/forms";

class ReservationService {
    constructor(private privateAPI: AxiosInstance) { }

    async createReservation(
        sale: CreateSaleForm,
        reservation: CreateReservationForm
    ) {
        interface ReservationResponse {
            reservation_id: number;
            sale_id: number;
        }

        const response = await this.privateAPI.post<APIResponse<ReservationResponse>>(
            '/agency/reservations/',
            { sale, reservation }
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
