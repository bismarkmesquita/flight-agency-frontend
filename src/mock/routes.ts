/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock of every endpoint the services call. Each handler mirrors its Django view
// (backend/<app>/views*): same validation order, `reason` codes, envelope and serialization.
import { addDays, addHours, format, parseISO } from "date-fns";
import { AccessLevel } from "@/auth/enums/access-level";
import { UserRole } from "@/auth/enums/user-role";
import { findById, getTables, insert, update } from "./db";
import { DbCustomer, DbFlight, DbReservation, DbSale, DbSupplier, DbUser } from "./types";

export type HttpMethod = "get" | "post" | "put" | "delete";

export interface MockResult {
    status: number;
    body: unknown;
}

type Payload = Record<string, any>;

interface Context {
    params: Record<string, string>;
    query: URLSearchParams;
    body: Payload;
    user: DbUser;
}

interface MockRoute {
    method: HttpMethod;
    pattern: string;
    handler: (ctx: Context) => MockResult;
    /** No token required (login). */
    isPublic?: boolean;
    /** users.permissions.HasRole */
    roles?: UserRole[];
    /** BaseAPIView.restrict_write_to_full_user — defaults to true, like the backend. */
    restrictWriteToFullUser?: boolean;
}

export interface MockRequest {
    method: HttpMethod;
    path: string;
    query: URLSearchParams;
    body: Payload;
    token: string | null;
}

const MANAGEMENT_ROLES = [UserRole.ADMIN, UserRole.MANAGER];
const DATE_FORMAT = "yyyy-MM-dd";
const TOKEN_TTL_HOURS = 10; // knox default

// core/views.py BaseAPIView
const ok = (data: unknown = null, message: string | null = null): MockResult => ({
    status: 200,
    body: { success: true, data, message },
});

const fail = (message: string, reason: string): MockResult => ({
    status: 200,
    body: { success: false, message, reason, errors: null },
});

// DRF permission failures
const notAuthenticated = (): MockResult => ({
    status: 401,
    body: { detail: "Authentication credentials were not provided." },
});

const forbidden = (): MockResult => ({
    status: 403,
    body: { detail: "You do not have permission to perform this action." },
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidEmail = (value: unknown) => typeof value === "string" && EMAIL_REGEX.test(value);
const missing = (data: Payload, fields: string[], isMissing: (value: unknown) => boolean) =>
    fields.filter((field) => isMissing(data[field]));
const isFalsy = (value: unknown) => !value;
const isNone = (value: unknown) => value === null || value === undefined;

function mustFind<T extends "users" | "customers" | "airlines" | "airports" | "suppliers">(
    table: T,
    id: number,
) {
    return findById(table, id)!;
}

// ---------------------------------------------------------------- serializers

const flightIata = (flight: DbFlight) => `${mustFind("airlines", flight.airline_id).iata}${flight.flight_number}`;

const serializeAirportShort = (id: number) => {
    const airport = mustFind("airports", id);
    return { id: airport.id, iata: airport.iata, city: airport.city };
};

const serializeUserShort = (user: { id: number; name: string }) => ({ id: user.id, name: user.name });

const serializeCustomer = (customer: DbCustomer) => ({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
});

const serializeSupplier = (supplier: DbSupplier) => ({
    id: supplier.id,
    name: supplier.name,
    tax_id: supplier.tax_id,
    phone: supplier.phone,
    country: supplier.country,
    postal_code: supplier.postal_code,
    city: supplier.city,
    state: supplier.state,
    neighborhood: supplier.neighborhood,
    address: supplier.address,
    address_number: supplier.address_number,
    complement: supplier.complement,
});

// agency/views/reservations.py BaseReservationView
function serializeReservation(reservation: DbReservation) {
    const sale = findById("sales", reservation.sale_id)!;
    const supplier = mustFind("suppliers", reservation.supplier_id);
    return {
        id: reservation.id,
        locator: reservation.locator,
        passenger_count: reservation.passenger_count,
        flights: reservation.flight_ids.map((id) => {
            const flight = findById("flights", id)!;
            return {
                iata: flightIata(flight),
                departure_airport: mustFind("airports", flight.departure_airport_id).iata,
                arrival_airport: mustFind("airports", flight.arrival_airport_id).iata,
                departure_date: flight.departure_date,
            };
        }),
        sale: {
            id: sale.id,
            type: sale.type,
            seller: serializeUserShort(mustFind("users", sale.seller_id)),
            customer: serializeUserShort(mustFind("customers", sale.customer_id)),
            payment: sale.payment,
            amount_received: sale.amount_received,
            cost: sale.cost,
            profit: sale.amount_received - sale.cost,
            sale_date: sale.sale_date,
            indication: sale.indication,
        },
        issuer: serializeUserShort(mustFind("users", reservation.issuer_id)),
        supplier: { id: supplier.id, name: supplier.name, tax_id: supplier.tax_id },
    };
}

// ---------------------------------------------------------------- auth (users/views.py)

const createToken = (user: DbUser) => `mock.${user.id}.${Math.random().toString(36).slice(2)}`;

export function userFromToken(token: string | null): DbUser | undefined {
    const match = token ? /^mock\.(\d+)\./.exec(token) : null;
    return match ? findById("users", Number(match[1])) : undefined;
}

function login({ body }: Context): MockResult {
    const user = getTables().users.find(
        (u) => u.email === body.login && u.password !== null && u.password === body.password,
    );
    if (!user) {
        return fail("Incorrect email or password.", "INVALID_CREDENTIALS");
    }

    const expiry = body.keep_connected ? addDays(new Date(), 365) : addHours(new Date(), TOKEN_TTL_HOURS);

    // knox's raw response — the only un-enveloped endpoint (users/serializers.py UserSerializer)
    return {
        status: 200,
        body: {
            expiry: expiry.toISOString(),
            token: createToken(user),
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                access_level: user.access_level,
            },
        },
    };
}

const serializeUser = (user: DbUser) => ({ id: user.id, name: user.name, email: user.email, role: user.role });

function validateUser(data: Payload, id?: number): [Payload | null, MockResult | null] {
    const missingFields = missing(data, ["name", "email", "role"], isFalsy);
    if (missingFields.length) {
        return [null, fail(`Required fields: ${missingFields.join(", ")}`, "MISSING_FIELDS")];
    }
    if (!isValidEmail(data.email)) {
        return [null, fail("Invalid email address.", "INVALID_EMAIL")];
    }
    if (![UserRole.MANAGER, UserRole.SELLER].includes(data.role)) {
        return [null, fail("Invalid role.", "INVALID_ROLE")];
    }
    if (getTables().users.some((u) => u.email === data.email && u.id !== id)) {
        return [null, fail("A user with this email address already exists.", "ALREADY_REGISTERED")];
    }
    return [{ name: data.name, email: data.email, role: data.role }, null];
}

function createUser({ body }: Context): MockResult {
    const [data, error] = validateUser(body);
    if (error) return error;

    const user = insert("users", {
        name: data!.name,
        email: data!.email,
        role: data!.role,
        access_level: AccessLevel.DEMO, // User model default; created users have no password anyway
        password: null,
        last_access: null,
    });
    return ok(serializeUser(user), "User successfully registered.");
}

function updateUser({ params, body }: Context): MockResult {
    const id = Number(params.id);
    const user = findById("users", id);
    if (!user) {
        return fail("User not found.", "INVALID_USER");
    }
    if (user.role === UserRole.ADMIN) {
        return fail("Administrator users cannot be modified.", "INVALID_ROLE");
    }

    const [data, error] = validateUser(body, id);
    if (error) return error;

    return ok(serializeUser(update("users", id, data!)!), "User updated successfully.");
}

function listUsers(): MockResult {
    const users = getTables()
        .users.filter((u) => u.role !== UserRole.ADMIN)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((u) => ({ id: u.id, name: u.name, email: u.email, last_access: u.last_access, role: u.role }));
    return ok(users);
}

// ---------------------------------------------------------------- customers (agency/views/customers.py)

function validateCustomer(data: Payload, id?: number): [Payload | null, MockResult | null] {
    const missingFields = missing(data, ["name", "email", "phone"], isFalsy);
    if (missingFields.length) {
        return [null, fail(`Required fields: ${missingFields.join(", ")}`, "MISSING_FIELDS")];
    }
    if (!isValidEmail(data.email)) {
        return [null, fail("The email address is not in a valid format.", "INVALID_EMAIL")];
    }
    const exists = getTables().customers.some(
        (c) => (c.email === data.email || c.phone === data.phone) && c.id !== id,
    );
    if (exists) {
        return [
            null,
            fail(
                "A customer already exists with an email address or phone number provided.",
                "ALREADY_REGISTERED",
            ),
        ];
    }
    return [{ name: data.name, email: data.email, phone: data.phone }, null];
}

const customerNotFound = () => fail("Customer not found.", "INVALID_CUSTOMER");

function createCustomer({ body }: Context): MockResult {
    const [data, error] = validateCustomer(body);
    if (error) return error;

    const customer = insert("customers", {
        name: data!.name,
        email: data!.email,
        phone: data!.phone,
        is_active: true,
    });
    return ok(serializeCustomer(customer), "Customer successfully registered.");
}

function getCustomer({ params }: Context): MockResult {
    const customer = findById("customers", Number(params.id));
    return customer ? ok(serializeCustomer(customer)) : customerNotFound();
}

function updateCustomer({ params, body }: Context): MockResult {
    const id = Number(params.id);
    if (!findById("customers", id)) return customerNotFound();

    const [data, error] = validateCustomer(body, id);
    if (error) return error;

    return ok(serializeCustomer(update("customers", id, data!)!), "Customer successfully registered.");
}

function deleteCustomer({ params }: Context): MockResult {
    const id = Number(params.id);
    if (!findById("customers", id)) return customerNotFound();

    update("customers", id, { is_active: false });
    return ok(null, "Customer deleted successfully.");
}

// ---------------------------------------------------------------- suppliers (agency/views/suppliers.py)

const SUPPLIER_REQUIRED_FIELDS = [
    "name",
    "phone",
    "country",
    "postal_code",
    "city",
    "state",
    "neighborhood",
    "address",
    "address_number",
];

function validateSupplier(data: Payload, id?: number): [Payload | null, MockResult | null] {
    const missingFields = missing(data, SUPPLIER_REQUIRED_FIELDS, isNone);
    if (missingFields.length) {
        return [null, fail(`Required fields: ${missingFields.join(", ")}`, "MISSING_FIELDS")];
    }

    const phone = data.phone;
    const taxId = data.tax_id ?? null;
    // Same Q() OR-filter as the backend: with neither phone nor tax_id, it matches every supplier.
    const exists = getTables().suppliers.some(
        (s) =>
            s.id !== id &&
            ((!phone && !taxId) || (phone && s.phone === phone) || (taxId && s.tax_id === taxId)),
    );
    if (exists) {
        return [
            null,
            fail("A supplier already exists with the provided phone number or tax ID.", "ALREADY_REGISTERED"),
        ];
    }

    const validated: Payload = { tax_id: taxId, complement: data.complement ?? null };
    SUPPLIER_REQUIRED_FIELDS.forEach((field) => (validated[field] = data[field]));
    return [validated, null];
}

const supplierNotFound = () => fail("Supplier not found.", "INVALID_SUPPLIER");

function listSuppliers(): MockResult {
    const suppliers = [...getTables().suppliers].sort((a, b) => a.name.localeCompare(b.name));
    return ok(suppliers.map(serializeSupplier));
}

function createSupplier({ body }: Context): MockResult {
    const [data, error] = validateSupplier(body);
    if (error) return error;

    const supplier = insert("suppliers", { ...(data as Omit<DbSupplier, "id" | "is_active">), is_active: true });
    return ok(serializeSupplier(supplier), "Supplier successfully registered.");
}

function getSupplier({ params }: Context): MockResult {
    const supplier = findById("suppliers", Number(params.id));
    return supplier ? ok(serializeSupplier(supplier)) : supplierNotFound();
}

function updateSupplier({ params, body }: Context): MockResult {
    const id = Number(params.id);
    if (!findById("suppliers", id)) return supplierNotFound();

    const [data, error] = validateSupplier(body, id);
    if (error) return error;

    return ok(serializeSupplier(update("suppliers", id, data!)!), "Supplier updated successfully.");
}

function deleteSupplier({ params }: Context): MockResult {
    const id = Number(params.id);
    if (!findById("suppliers", id)) return supplierNotFound();

    update("suppliers", id, { is_active: false });
    return ok(null, "Supplier deleted successfully.");
}

// ---------------------------------------------------------------- reservations (agency/views/reservations.py)

const isSellerOf = (user: DbUser) => (sale: DbSale) => user.role !== UserRole.SELLER || sale.seller_id === user.id;

function listReservations({ user }: Context): MockResult {
    const visible = isSellerOf(user);
    const reservations = getTables().reservations.filter((r) => visible(findById("sales", r.sale_id)!));
    return ok(reservations.map(serializeReservation));
}

// django.utils.dateparse.parse_date — returns the date as yyyy-MM-dd, or null when invalid.
function parseDate(value: unknown): string | null {
    if (typeof value !== "string" || !/^\d{4}-\d{1,2}-\d{1,2}$/.test(value)) return null;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const valid = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    return valid ? format(date, DATE_FORMAT) : null;
}

function createReservation({ body, user }: Context): MockResult {
    const saleData: Payload = body.sale;
    const reservationData: Payload = body.reservation;

    if (typeof saleData !== "object" || saleData === null || Array.isArray(saleData)) {
        return fail("Sale data must be an object.", "MISSING_FIELDS");
    }
    if (typeof reservationData !== "object" || reservationData === null || Array.isArray(reservationData)) {
        return fail("Reservation data must be an object.", "MISSING_FIELDS");
    }

    const missingSale = missing(
        saleData,
        ["seller_id", "customer_id", "type", "payment", "amount_received", "cost", "sale_date"],
        isNone,
    );
    if (missingSale.length) {
        return fail(`Required sale fields: ${missingSale.join(", ")}`, "MISSING_FIELDS");
    }

    const missingReservation = missing(
        reservationData,
        ["locator", "passenger_count", "supplier_id", "issuer_id", "flight_ids"],
        isNone,
    );
    if (missingReservation.length) {
        return fail(`Required reservation fields: ${missingReservation.join(", ")}`, "MISSING_FIELDS");
    }

    const amountReceived = Number(String(saleData.amount_received));
    const cost = Number(String(saleData.cost));
    if (Number.isNaN(amountReceived) || Number.isNaN(cost)) {
        return fail("Invalid numeric values.", "VALIDATION_ERROR");
    }
    if (amountReceived <= 0) {
        return fail("Amount received must be greater than zero.", "VALIDATION_ERROR");
    }
    if (cost < 0) {
        return fail("Cost cannot be negative.", "VALIDATION_ERROR");
    }

    const seller = user.role === UserRole.SELLER ? user : findById("users", Number(saleData.seller_id));
    if (!seller) {
        return fail("Seller not found.", "OBJECT_NOT_FOUND");
    }

    const customer = findById("customers", Number(saleData.customer_id));
    if (!customer) {
        return fail("Customer not found.", "OBJECT_NOT_FOUND");
    }

    const saleDate = parseDate(saleData.sale_date);
    if (!saleDate) {
        return fail("Invalid sale date.", "VALIDATION_ERROR");
    }

    const supplier = findById("suppliers", Number(reservationData.supplier_id));
    if (!supplier) {
        return fail("Supplier not found.", "OBJECT_NOT_FOUND");
    }

    const issuer = findById("users", Number(reservationData.issuer_id));
    if (!issuer) {
        return fail("Issuer not found.", "OBJECT_NOT_FOUND");
    }

    if (getTables().reservations.some((r) => r.locator === reservationData.locator)) {
        return fail("A reservation already exists with the provided locator number.", "ALREADY_REGISTERED");
    }

    const flightIds: number[] = Array.isArray(reservationData.flight_ids)
        ? [...new Set<number>(reservationData.flight_ids.map(Number))]
        : [];
    if (!flightIds.every((id) => findById("flights", id))) {
        return fail("One or more flights do not exist.", "OBJECT_NOT_FOUND");
    }

    const sale = insert("sales", {
        seller_id: seller.id,
        customer_id: customer.id,
        type: saleData.type,
        payment: saleData.payment,
        amount_received: amountReceived,
        cost,
        sale_date: saleDate,
        indication: saleData.indication ?? null,
    });

    const reservation = insert("reservations", {
        locator: reservationData.locator,
        sale_id: sale.id,
        supplier_id: supplier.id,
        issuer_id: issuer.id,
        passenger_count: Number(reservationData.passenger_count),
        passengers: reservationData.passengers ?? null,
        flight_ids: flightIds,
    });

    return ok({ reservation_id: reservation.id, sale_id: sale.id }, "Reservation successfully registered.");
}

// ---------------------------------------------------------------- dashboard (agency/views/dashboard.py)

function getDateRange(query: URLSearchParams): [string, string] {
    const period = query.get("period");
    const start = parseDate(query.get("start"));
    const end = parseDate(query.get("end"));
    const today = new Date();
    const day = (date: Date) => format(date, DATE_FORMAT);

    if (start && end) return [start, end];
    if (period === "30d") return [day(addDays(today, -29)), day(today)];
    if (period === "month") return [day(new Date(today.getFullYear(), today.getMonth(), 1)), day(today)];
    if (period === "year") return [day(new Date(today.getFullYear(), 0, 1)), day(today)];
    return [day(addDays(today, -6)), day(today)]; // "7d" and fallback
}

interface Ranking {
    name: string;
    total: number;
    sales: number;
    reservations: number;
}

function rank(sales: DbSale[], reservations: DbReservation[], key: "seller_id" | "customer_id") {
    const table = key === "seller_id" ? "users" : "customers";
    const rows = new Map<number, Ranking>();

    sales.forEach((sale) => {
        const id = sale[key];
        const row = rows.get(id) ?? { name: mustFind(table, id).name, total: 0, sales: 0, reservations: 0 };
        row.total += sale.amount_received;
        row.sales += 1;
        rows.set(id, row);
    });

    reservations.forEach((reservation) => {
        const row = rows.get(findById("sales", reservation.sale_id)![key]);
        if (row) row.reservations += 1;
    });

    return [...rows.values()].sort((a, b) => b.total - a.total);
}

function dashboard({ query, user }: Context): MockResult {
    const [startDate, endDate] = getDateRange(query);
    const mode = user.role === UserRole.SELLER ? "seller" : "admin";
    const visible = isSellerOf(user);
    const inRange = (sale: DbSale) => sale.sale_date >= startDate && sale.sale_date <= endDate && visible(sale);

    const { sales: allSales, reservations: allReservations } = getTables();
    const sales = allSales.filter(inRange);
    const reservations = allReservations.filter((r) => inRange(findById("sales", r.sale_id)!));

    const totalSold = sales.reduce((sum, s) => sum + s.amount_received, 0);
    const totalProfit = sales.reduce((sum, s) => sum + s.amount_received - s.cost, 0);

    const kpis: Payload = {
        total_sold: totalSold,
        total_sales: sales.length,
        total_reservations: reservations.length,
        avg_ticket: sales.length ? totalSold / sales.length : 0,
    };
    if (mode === "admin") kpis.total_profit = totalProfit;

    const salesChart: { label: string; value: number }[] = [];
    const profitChart: { label: string; value: number }[] = [];
    for (let date = parseISO(startDate); format(date, DATE_FORMAT) <= endDate; date = addDays(date, 1)) {
        const label = format(date, DATE_FORMAT);
        const daySales = sales.filter((s) => s.sale_date === label);
        salesChart.push({ label, value: daySales.reduce((sum, s) => sum + s.amount_received, 0) });
        profitChart.push({ label, value: daySales.reduce((sum, s) => sum + s.amount_received - s.cost, 0) });
    }

    const charts: Payload = { sales: salesChart };
    const tables: Payload = { customers: rank(sales, reservations, "customer_id") };
    if (mode === "admin") {
        charts.profit = profitChart;
        tables.sellers = rank(sales, reservations, "seller_id");
    }

    return ok({ kpis, charts, tables, mode });
}

// ---------------------------------------------------------------- flights (flights/views.py)

function listAirlines(): MockResult {
    return ok(getTables().airlines.map(({ id, name, iata }) => ({ id, name, iata })));
}

function listAirports(): MockResult {
    return ok(getTables().airports.map(({ id, name, iata, icao, city, country }) => ({ id, name, iata, icao, city, country })));
}

function nextFlights(): MockResult {
    const now = new Date().toISOString();
    const { flights, reservations } = getTables();

    const upcoming = flights
        .filter((f) => f.departure_date >= now)
        .sort((a, b) => a.departure_date.localeCompare(b.departure_date))
        .slice(0, 15)
        .map((flight) => ({
            id: flight.id,
            iata: flightIata(flight),
            airline: { id: flight.airline_id, iata: mustFind("airlines", flight.airline_id).iata },
            departure_date: flight.departure_date,
            arrival_date: flight.arrival_date,
            departure_airport: serializeAirportShort(flight.departure_airport_id),
            arrival_airport: serializeAirportShort(flight.arrival_airport_id),
            reservations: reservations
                .filter((r) => r.flight_ids.includes(flight.id))
                .map((r) => {
                    const customer = mustFind("customers", findById("sales", r.sale_id)!.customer_id);
                    return { locator: r.locator, name: customer.name, phone: customer.phone || null };
                }),
        }));

    return ok(upcoming);
}

function createFlight({ body }: Context): MockResult {
    const missingFields = missing(
        body,
        ["flight_number", "airline_id", "departure_airport_id", "arrival_airport_id", "departure_date", "arrival_date"],
        isFalsy,
    );
    if (missingFields.length) {
        return fail(`Required fields: ${missingFields.join(", ")}`, "MISSING_FIELDS");
    }

    if (!/^\d{1,4}$/.test(String(body.flight_number))) {
        return fail("Invalid flight number.", "INVALID_FLIGHT_NUMBER");
    }
    if (body.departure_airport_id === body.arrival_airport_id) {
        return fail("Choose different airports.", "INVALID_AIRPORT");
    }

    const departure = new Date(body.departure_date);
    const arrival = new Date(body.arrival_date);
    if (Number.isNaN(departure.getTime()) || Number.isNaN(arrival.getTime())) {
        return fail("Invalid dates.", "INVALID_DATE");
    }
    if (arrival <= departure) {
        return fail("Arrival date must be after departure date.", "INVALID_DATE");
    }

    const airline = findById("airlines", Number(body.airline_id));
    if (!airline) {
        return fail("Airline not found.", "INVALID_AIRLINE");
    }

    const departureAirport = findById("airports", Number(body.departure_airport_id));
    const arrivalAirport = findById("airports", Number(body.arrival_airport_id));
    if (!departureAirport || !arrivalAirport) {
        return fail("Invalid airport.", "INVALID_AIRPORT");
    }

    const flightNumber = String(body.flight_number);
    const departureDate = departure.toISOString();
    const duplicated = getTables().flights.some(
        (f) => f.flight_number === flightNumber && f.airline_id === airline.id && f.departure_date === departureDate,
    );
    if (duplicated) {
        return fail("There is already a flight with the IATA code and dates provided.", "ALREADY_REGISTERED");
    }

    const flight = insert("flights", {
        flight_number: flightNumber,
        airline_id: airline.id,
        departure_airport_id: departureAirport.id,
        arrival_airport_id: arrivalAirport.id,
        departure_date: departureDate,
        arrival_date: arrival.toISOString(),
    });

    return ok(
        {
            id: flight.id,
            iata: flightIata(flight),
            airline: { id: airline.id, name: airline.name },
            departure_date: flight.departure_date,
            arrival_date: flight.arrival_date,
            departure_airport: serializeAirportShort(departureAirport.id),
            arrival_airport: serializeAirportShort(arrivalAirport.id),
        },
        "Flight successfully registered.",
    );
}

// ---------------------------------------------------------------- routing table

const routes: MockRoute[] = [
    // users/urls.py
    { method: "post", pattern: "/auth/login/", handler: login, isPublic: true },
    { method: "post", pattern: "/auth/logout/", handler: () => ok(), restrictWriteToFullUser: false },
    { method: "get", pattern: "/auth/users/", handler: listUsers },
    {
        method: "post",
        pattern: "/auth/create/",
        handler: createUser,
        roles: MANAGEMENT_ROLES,
        restrictWriteToFullUser: false,
    },
    {
        method: "put",
        pattern: "/auth/update/:id/",
        handler: updateUser,
        roles: MANAGEMENT_ROLES,
        restrictWriteToFullUser: false,
    },

    // agency/urls.py
    { method: "get", pattern: "/agency/customers/", handler: () => ok(getTables().customers.map(serializeCustomer)) },
    { method: "post", pattern: "/agency/customers/", handler: createCustomer },
    { method: "get", pattern: "/agency/customers/:id/", handler: getCustomer },
    { method: "put", pattern: "/agency/customers/:id/", handler: updateCustomer },
    { method: "delete", pattern: "/agency/customers/:id/", handler: deleteCustomer },
    { method: "get", pattern: "/agency/reservations/", handler: listReservations },
    { method: "post", pattern: "/agency/reservations/", handler: createReservation },
    { method: "get", pattern: "/agency/suppliers/", handler: listSuppliers },
    { method: "post", pattern: "/agency/suppliers/create/", handler: createSupplier, roles: MANAGEMENT_ROLES },
    { method: "get", pattern: "/agency/suppliers/:id/", handler: getSupplier, roles: MANAGEMENT_ROLES },
    { method: "put", pattern: "/agency/suppliers/:id/", handler: updateSupplier, roles: MANAGEMENT_ROLES },
    { method: "delete", pattern: "/agency/suppliers/:id/", handler: deleteSupplier, roles: MANAGEMENT_ROLES },
    { method: "get", pattern: "/agency/dashboard/", handler: dashboard },

    // flights/urls.py
    { method: "get", pattern: "/flights/airlines/", handler: listAirlines },
    { method: "get", pattern: "/flights/airports/", handler: listAirports },
    { method: "post", pattern: "/flights/", handler: createFlight },
    { method: "get", pattern: "/flights/next/", handler: nextFlights },
];

function matchPattern(pattern: string, path: string): Record<string, string> | null {
    const names: string[] = [];
    const regex = new RegExp(
        "^" +
            pattern.replace(/:(\w+)/g, (_, name: string) => {
                names.push(name);
                return "(\\d+)"; // Django's <int:id>
            }) +
            "$",
    );
    const match = regex.exec(path);
    if (!match) return null;
    return Object.fromEntries(names.map((name, index) => [name, match[index + 1]]));
}

/** Returns null when no route matches (the adapter turns that into a 404). */
export function handleRequest(request: MockRequest): MockResult | null {
    for (const route of routes) {
        if (route.method !== request.method) continue;
        const params = matchPattern(route.pattern, request.path);
        if (!params) continue;

        const user = userFromToken(request.token);
        if (route.isPublic) {
            return route.handler({ params, query: request.query, body: request.body, user: user! });
        }
        if (!user) return notAuthenticated();
        if (route.roles && !route.roles.includes(user.role)) return forbidden();
        const isWrite = request.method !== "get";
        if (isWrite && route.restrictWriteToFullUser !== false && user.access_level !== AccessLevel.FULL) {
            return forbidden();
        }

        return route.handler({ params, query: request.query, body: request.body, user });
    }
    return null;
}
