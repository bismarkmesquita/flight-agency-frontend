// Demo data generator — mirrors backend/users/management/commands/populate_demo.py.
// Only run through `npm run mock:generate` (scripts/generate-mock.ts); never imported by the app,
// so faker stays out of the client bundle.
import { faker } from "@faker-js/faker";
import { AccessLevel } from "@/auth/enums/access-level";
import { UserRole } from "@/auth/enums/user-role";
import { PAYMENT_METHOD_LABELS, PaymentMethod, SaleType } from "@/reservations/models/sale";
import {
    DbAirline,
    DbAirport,
    DbCustomer,
    DbReservation,
    DbSupplier,
    DbUser,
    SeedFlight,
    SeedSale,
    SeedTables,
} from "./types";

const USER_COUNT = 50;
const SUPPLIER_COUNT = 10;
const CUSTOMER_COUNT = 100;
const AIRPORT_COUNT = 50;
const FLIGHT_COUNT = 50;
const SALE_COUNT = 100;
const RESERVATION_COUNT = 100;

const AIRLINES: [string, string][] = [
    ["LATAM", "LA"],
    ["Gol", "G3"],
    ["Azul", "AD"],
    ["American Airlines", "AA"],
    ["United", "UA"],
];

const int = (min: number, max: number) => faker.number.int({ min, max });

function unique<T>(make: () => T, used: Set<T>): T {
    let value = make();
    while (used.has(value)) {
        value = make();
    }
    used.add(value);
    return value;
}

// North American 555-0100…555-0199 numbers are reserved for fiction in every area code, so no
// generated phone reaches a real person. Format: 1 + area code + 55501XX (11 digits, e.g. 12125550142).
const fictionalPhone = () => `1${int(201, 989)}55501${faker.string.numeric(2)}`;

function genUsers(): DbUser[] {
    const user = (
        id: number,
        email: string,
        name: string,
        role: UserRole,
        password: string | null,
    ): DbUser => ({
        id,
        email,
        name,
        role,
        password,
        // Every user is FULL in the mock: data only lives in the visitor's browser,
        // so there is nothing to protect by keeping the demo read-only.
        access_level: AccessLevel.FULL,
        last_access: null,
    });

    const users = [
        user(1, "agency@agency.com", "Agency Admin", UserRole.ADMIN, "agency"),
        user(2, "manager@agency.dev", "manager", UserRole.MANAGER, "manager123"),
        user(3, "seller@agency.dev", "Seller", UserRole.SELLER, "seller123"),
    ];
    for (let i = 0; i < USER_COUNT; i++) {
        users.push(user(users.length + 1, `user${i}@user${i}.com`, `User ${i}`, UserRole.SELLER, null));
    }
    return users;
}

function genAirlines(): DbAirline[] {
    return AIRLINES.map(([name, iata], index) => ({ id: index + 1, name, iata }));
}

function genSuppliers(): DbSupplier[] {
    const phones = new Set<string>();
    return Array.from({ length: SUPPLIER_COUNT }, (_, index) => ({
        id: index + 1,
        name: faker.company.name(),
        tax_id: faker.string.numeric(13),
        phone: unique(fictionalPhone, phones),
        country: faker.location.country(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }).slice(0, 2),
        postal_code: faker.location.zipCode("#####"),
        neighborhood: faker.location.street(),
        address: faker.location.streetAddress(),
        address_number: String(int(1, 999)),
        complement: null,
        is_active: true,
    }));
}

function genCustomers(): DbCustomer[] {
    const emails = new Set<string>();
    const phones = new Set<string>();
    return Array.from({ length: CUSTOMER_COUNT }, (_, index) => {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        return {
            id: index + 1,
            name: `${firstName} ${lastName}`,
            email: unique(
                () => faker.internet.email({ firstName, lastName }).toLowerCase(),
                emails,
            ),
            phone: unique(fictionalPhone, phones),
            is_active: true,
        };
    });
}

function genAirports(): DbAirport[] {
    const usedIata = new Set<string>();
    const usedIcao = new Set<string>();
    return Array.from({ length: AIRPORT_COUNT }, (_, index) => {
        const iata = unique(() => faker.string.alpha({ length: 3, casing: "upper" }), usedIata);
        const icao = unique(() => faker.string.alpha({ length: 4, casing: "upper" }), usedIcao);
        const city = faker.location.city();
        return {
            id: index + 1,
            iata,
            icao,
            name: `${city} International Airport`,
            city,
            country: faker.location.country(),
        };
    });
}

// The backend spreads flights over the current calendar year; here they are spread around
// "today" (±6 months) so /flights/next/ always has upcoming flights.
function genFlights(airlines: DbAirline[], airports: DbAirport[]): SeedFlight[] {
    return Array.from({ length: FLIGHT_COUNT }, (_, index) => {
        const departure = faker.helpers.arrayElement(airports);
        const arrival = faker.helpers.arrayElement(airports.filter((a) => a.id !== departure.id));
        return {
            id: index + 1,
            flight_number: String(int(100, 9999)),
            airline_id: faker.helpers.arrayElement(airlines).id,
            departure_airport_id: departure.id,
            arrival_airport_id: arrival.id,
            departure_offset_days: int(-180, 180),
            departure_minute: int(0, 24 * 60 - 1),
            duration_minutes: int(1, 12) * 60,
        };
    });
}

// Sales only in the past year, so every dashboard period (7d / 30d / month / year) has data.
function genSales(seller: DbUser, customers: DbCustomer[]): SeedSale[] {
    const payments = Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[];
    const types: SaleType[] = ["b2c", "b2b"];
    return Array.from({ length: SALE_COUNT }, (_, index) => {
        const amount = int(500, 5000);
        return {
            id: index + 1,
            seller_id: seller.id,
            customer_id: faker.helpers.arrayElement(customers).id,
            type: faker.helpers.arrayElement(types),
            payment: faker.helpers.arrayElement(payments),
            amount_received: amount,
            cost: amount - int(50, 500),
            sale_date_offset_days: int(-364, 0),
            indication: faker.helpers.arrayElement([null, faker.person.firstName()]),
        };
    });
}

function genReservations(
    sales: SeedSale[],
    suppliers: DbSupplier[],
    issuers: DbUser[],
    flights: SeedFlight[],
): DbReservation[] {
    const locators = new Set<string>();
    return Array.from({ length: RESERVATION_COUNT }, (_, index) => {
        const passengerCount = int(1, 4);
        return {
            id: index + 1,
            locator: unique(
                () => faker.string.alpha({ length: 3, casing: "upper" }) + faker.string.numeric(3),
                locators,
            ),
            sale_id: faker.helpers.arrayElement(sales).id,
            supplier_id: faker.helpers.arrayElement(suppliers).id,
            issuer_id: faker.helpers.arrayElement(issuers).id,
            passenger_count: passengerCount,
            passengers: Array.from({ length: passengerCount }, () => faker.person.fullName()).join(", "),
            flight_ids: faker.helpers.arrayElements(flights, int(1, 4)).map((f) => f.id),
        };
    });
}

export function generateSeed(): SeedTables {
    faker.seed(42);

    const users = genUsers();
    const seller = users.find((u) => u.email === "seller@agency.dev")!;
    const bulkUsers = users.filter((u) => u.email.startsWith("user"));

    const airlines = genAirlines();
    const suppliers = genSuppliers();
    const customers = genCustomers();
    const airports = genAirports();
    const flights = genFlights(airlines, airports);
    const sales = genSales(seller, customers);
    const reservations = genReservations(sales, suppliers, bulkUsers, flights);

    return { users, airlines, suppliers, customers, airports, flights, sales, reservations };
}
