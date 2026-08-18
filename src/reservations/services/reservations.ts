import { useMemo } from "react";
import { AxiosInstance } from "axios";
import { useFrontendPagination } from "@/base/services/api";
import { APIResponse, usePrivateAPI } from "@/base/services/api";
import { Sale } from "../models/sale";
import { Reservation } from "@/reservations/models/reservation";
import { CreateReservationForm, CreateSaleForm } from "../models/forms";

class ReservationService {
    constructor(private privateAPI: AxiosInstance) { }

    async createReservation(data: CreateReservationForm) {
        interface ReservationResponse {
            reservation: Reservation;
        }
        const response = await this.privateAPI.post<APIResponse<ReservationResponse>>(
            '/agency/reservations/',
            data
        );
        return response.data;
    }

    async createSale(data: CreateSaleForm) {
        interface SaleResponse {
            sale: Sale;
        }
        const response = await this.privateAPI.post<APIResponse<SaleResponse>>(
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
