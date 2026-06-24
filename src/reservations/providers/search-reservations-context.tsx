"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { usePaginatedReservation } from "../services/reservations";
import { compareDesc, format, parseISO } from "date-fns";
import { Reservation } from "@/reservations/models/reservation";

interface SearchReservationsContextType {
    searchQuery: string;
    setSearchQuery: (searchQuery: string) => void;
    months: string[];
    selectedMonth: string | null;
    setSelectedMonth: (month: string | null) => void;

    filteredReservations: Reservation[];

    page: number;
    numPages: number;
    setPage: (page: number) => void;
    refreshQuery: () => void;
}

const SearchReservationsContext = createContext<SearchReservationsContextType | null>(null);

export function SearchReservationsProvider({ children }: { children: ReactNode }) {
    const paginatedReservations = usePaginatedReservation();
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

    const months = useMemo(() => {
        const options = new Set<string>();

        paginatedReservations.allItems.forEach((reservation) => {
            if (reservation.sale.sale_date) {
                const d = parseISO(reservation.sale.sale_date);
                options.add(format(d, "MM/yyyy"));
            }
        });
        return Array.from(options).sort((a, b) => {
            const [ma, ya] = a.split("/").map(Number);
            const [mb, yb] = b.split("/").map(Number);

            return compareDesc(new Date(ya, ma - 1), new Date(yb, mb - 1));
        });
    }, [paginatedReservations.allItems]);

    const filteredReservations = useMemo(() => {
        const hasFilter = searchQuery || selectedMonth;

        if (!hasFilter) {
            return paginatedReservations.items;
        }

        return paginatedReservations.allItems.filter((reservation) => {
            const date = parseISO(reservation.sale.sale_date);
            const monthYear = format(date, "MM/yyyy");

            const searchLower = searchQuery.toLowerCase();
            const costumer = reservation.sale.customer.name?.toLowerCase() || '';
            const locator = reservation.locator?.toLowerCase() || '';
            const flights = reservation.flights
                .map((flight) => flight.flight_number?.toString() || "")
                .join(" ");

            const matchesSearch =
                !searchQuery ||
                costumer.includes(searchLower) ||
                flights.includes(searchLower) ||
                locator.includes(searchLower);

            const matchesMonth =
                !selectedMonth || monthYear === selectedMonth;

            return matchesSearch && matchesMonth;
        });

    }, [searchQuery, selectedMonth, paginatedReservations.items, paginatedReservations.allItems]);

    return (
        <SearchReservationsContext.Provider
            value={{
                searchQuery,
                setSearchQuery,
                months,
                selectedMonth,
                setSelectedMonth,
                filteredReservations,
                page: paginatedReservations.page,
                numPages: paginatedReservations.numPages,
                setPage: paginatedReservations.setPage,
                refreshQuery: paginatedReservations.refresh,
            }}
        >
            {children}
        </SearchReservationsContext.Provider>
    )
}

export const useSearchReservationsContext = () => {
    const context = useContext(SearchReservationsContext);
    if (!context) {
        throw new Error(
            'useSearchReservationsContext must be used within a SearchReservationsProvider'
        );
    }
    return context;
};
