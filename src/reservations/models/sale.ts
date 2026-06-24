import { User } from "@/auth/models/user";
import { Customer } from "@/customers/models/customer";

export const SALE_TYPE = {
    b2b: "B2B",
    b2c: "B2C",
} as const;

export const PAYMENT_METHOD_LABELS = {
    credit_card: "Credit Card",
    debit_card: "Debit Card",
    money: "Cash",
    transfer: "Transfer",
    ticket: "Ticket",
} as const;

export type SaleType = keyof typeof SALE_TYPE;
export type PaymentMethod = keyof typeof PAYMENT_METHOD_LABELS;

export interface Sale {
    id: number;
    seller: User;
    customer: Customer;
    type: SaleType;
    payment: PaymentMethod;
    amount_received: number;
    cost: number;
    sale_date: string;
    indication?: string;
    profit?: number;
}