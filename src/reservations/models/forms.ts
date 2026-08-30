import { PaymentMethod, SaleType } from "./sale";

export interface CreateReservationForm {
    sale_id: number;
    locator: string;
    passenger_count: number;
    passengers: string | null;
    flight_ids: number[];
    supplier_id: number;
    issuer_id: number;
}

export interface CreateSaleForm {
    seller_id: number;
    customer_id: number;
    type: SaleType;
    payment: PaymentMethod;
    amount_received: number;
    cost: number;
    sale_date: string;
    indication?: string;
}