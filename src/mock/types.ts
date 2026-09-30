import { AccessLevel } from "@/auth/enums/access-level";
import { UserRole } from "@/auth/enums/user-role";
import { Airline } from "@/flights/models/airline";
import { Airport } from "@/flights/models/airport";
import { PaymentMethod, SaleType } from "@/reservations/models/sale";

// Normalized "tables", shaped like the Django models (FKs as *_id), not like API output.
// Routes serialize these the same way each backend view does.

export interface DbUser {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    access_level: AccessLevel;
    password: string | null;
    last_access: string | null;
}

export interface DbCustomer {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    is_active: boolean;
}

export interface DbSupplier {
    id: number;
    name: string;
    tax_id: string | null;
    phone: string;
    country: string;
    postal_code: string;
    city: string;
    state: string;
    neighborhood: string;
    address: string;
    address_number: string;
    complement: string | null;
    is_active: boolean;
}

export type DbAirline = Airline;
export type DbAirport = Airport;

interface BaseFlight {
    id: number;
    flight_number: string;
    airline_id: number;
    departure_airport_id: number;
    arrival_airport_id: number;
}

interface BaseSale {
    id: number;
    seller_id: number;
    customer_id: number;
    type: SaleType;
    payment: PaymentMethod;
    amount_received: number;
    cost: number;
    indication: string | null;
}

export interface DbReservation {
    id: number;
    locator: string;
    sale_id: number;
    supplier_id: number;
    issuer_id: number;
    passenger_count: number;
    passengers: string | null;
    flight_ids: number[];
}

// data.json: dates stored as offsets relative to "today", so the demo never goes stale.
export interface SeedFlight extends BaseFlight {
    departure_offset_days: number;
    departure_minute: number;
    duration_minutes: number;
}

export interface SeedSale extends BaseSale {
    sale_date_offset_days: number;
}

// In-memory / persisted state: real dates.
export interface DbFlight extends BaseFlight {
    departure_date: string;
    arrival_date: string;
}

export interface DbSale extends BaseSale {
    sale_date: string; // yyyy-MM-dd
}

interface Tables<F, S> {
    users: DbUser[];
    airlines: DbAirline[];
    suppliers: DbSupplier[];
    customers: DbCustomer[];
    airports: DbAirport[];
    flights: F[];
    sales: S[];
    reservations: DbReservation[];
}

export type SeedTables = Tables<SeedFlight, SeedSale>;
export type DbTables = Tables<DbFlight, DbSale>;
export type TableName = keyof DbTables;
export type Row<T extends TableName> = DbTables[T][number];

export interface SeedData {
    version: string;
    tables: SeedTables;
}

export interface MockDb {
    version: string;
    /** Day (yyyy-MM-dd) the dates were last aligned to; used to shift them on later visits. */
    anchor_date: string;
    tables: DbTables;
}
