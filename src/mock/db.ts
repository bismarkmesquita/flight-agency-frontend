import { addDays, addMinutes, differenceInCalendarDays, format, parseISO, startOfDay } from "date-fns";
import seedJson from "./data.json";
import { DbTables, MockDb, Row, SeedData, TableName } from "./types";

// Kept out of the auth keys on purpose, but note clearAuth() (logout) calls localStorage.clear(),
// which also wipes this — logging out resets the demo.
const STORAGE_KEY = "_MOCK_DB";
const DATE_FORMAT = "yyyy-MM-dd";

const seed = seedJson as SeedData;

let db: MockDb | null = null;

function materialize(today: Date): MockDb {
    const base = startOfDay(today);
    const { flights, sales, ...rest } = seed.tables;

    return {
        version: seed.version,
        anchor_date: format(base, DATE_FORMAT),
        tables: {
            ...structuredClone(rest),
            flights: flights.map(({ departure_offset_days, departure_minute, duration_minutes, ...flight }) => {
                const departure = addMinutes(addDays(base, departure_offset_days), departure_minute);
                return {
                    ...flight,
                    departure_date: departure.toISOString(),
                    arrival_date: addMinutes(departure, duration_minutes).toISOString(),
                };
            }),
            sales: sales.map(({ sale_date_offset_days, ...sale }) => ({
                ...sale,
                sale_date: format(addDays(base, sale_date_offset_days), DATE_FORMAT),
            })),
        },
    };
}

// Moves every date forward by the days elapsed since the snapshot was saved, so returning
// visitors keep their own edits and still see upcoming flights.
function shiftDates(snapshot: MockDb, today: Date): MockDb {
    const days = differenceInCalendarDays(today, parseISO(snapshot.anchor_date));
    if (days === 0) {
        return snapshot;
    }

    const { tables } = snapshot;
    return {
        ...snapshot,
        anchor_date: format(today, DATE_FORMAT),
        tables: {
            ...tables,
            flights: tables.flights.map((flight) => ({
                ...flight,
                departure_date: addDays(parseISO(flight.departure_date), days).toISOString(),
                arrival_date: addDays(parseISO(flight.arrival_date), days).toISOString(),
            })),
            sales: tables.sales.map((sale) => ({
                ...sale,
                sale_date: format(addDays(parseISO(sale.sale_date), days), DATE_FORMAT),
            })),
        },
    };
}

function readStorage(): MockDb | null {
    if (typeof window === "undefined") {
        return null;
    }
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const stored: MockDb | null = raw ? JSON.parse(raw) : null;
        return stored?.version === seed.version ? stored : null;
    } catch {
        return null;
    }
}

function persist() {
    if (typeof window === "undefined" || !db) {
        return;
    }
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (error) {
        console.error("Could not persist mock database.", error);
    }
}

function load(): MockDb {
    const today = new Date();
    const stored = readStorage();
    db = stored ? shiftDates(stored, today) : materialize(today);
    if (db !== stored) {
        persist();
    }
    return db;
}

export function getTables(): DbTables {
    return (db ?? load()).tables;
}

export function findById<T extends TableName>(table: T, id: number): Row<T> | undefined {
    return (getTables()[table] as Row<T>[]).find((row) => row.id === id);
}

export function insert<T extends TableName>(table: T, data: Omit<Row<T>, "id">): Row<T> {
    const rows = getTables()[table] as Row<T>[];
    const id = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
    const row = { ...data, id } as Row<T>;
    rows.push(row);
    persist();
    return row;
}

export function update<T extends TableName>(
    table: T,
    id: number,
    patch: Partial<Omit<Row<T>, "id">>,
): Row<T> | undefined {
    const row = findById(table, id);
    if (row) {
        Object.assign(row, patch);
        persist();
    }
    return row;
}

export function resetDb() {
    if (typeof window !== "undefined") {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {
            // ignore: storage unavailable, the in-memory reset below still applies
        }
    }
    db = null;
    load();
}
