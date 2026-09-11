"use client";

import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { DashboardPeriod, useDashboardService } from "../services/dashboard";
import { useSnackbar } from "@/base/context/SnackbarContext";
import { CustomerRow, GetDashboardResponse, SellerRow } from "../models/dashboard";

interface DashboardContextType {
    loading: boolean;
    data: GetDashboardResponse | null;
    period: DashboardPeriod;
    setPeriod: (v: DashboardPeriod) => void;
    sellersOrdering: OrderingRanking;
    sortedSellers: SellerRow[];
    customersOrdering: OrderingRanking;
    sortedCustomers: CustomerRow[];
    setSellersOrdering: (v: OrderingRanking) => void;
    setCustomersOrdering: (v: OrderingRanking) => void;
}

const CustomersContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const snackbar = useSnackbar();
    const dashboardService = useDashboardService();
    const [data, setData] = useState<GetDashboardResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const [period, setPeriod] = useState<DashboardPeriod>("month");
    const [customersOrdering, setCustomersOrdering] = useState<OrderingRanking>(
        OrderingRanking.TOTAL
    );
    const [sellersOrdering, setSellersOrdering] = useState<OrderingRanking>(
        OrderingRanking.TOTAL
    );

    const sortedSellers = useMemo(() => {
        if (!data?.tables.sellers) return [];
        return sortAndLimitRanking(
            data.tables.sellers,
            sellersOrdering,
            10
        );
    }, [data?.tables.sellers, sellersOrdering]);

    const sortedCustomers = useMemo(() => {
        if (!data?.tables.customers) return [];
        return sortAndLimitRanking(
            data.tables.customers,
            customersOrdering,
            10
        );
    }, [data?.tables.customers, customersOrdering]);

    const fetchDashboard = useCallback(async () => {
        setLoading(true);

        const response = await dashboardService.fetchDashboard({ period });

        if (response.success) {
            setData(response.data ?? null);
        } else {
            snackbar.showSnackbar(`${response.message}`, "error");
        }

        setLoading(false);
    }, [dashboardService, period]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard])

    return (
        <CustomersContext.Provider
            value={{
                loading,
                data,
                period,
                setPeriod,
                sellersOrdering,
                sortedSellers,
                customersOrdering,
                sortedCustomers,
                setSellersOrdering,
                setCustomersOrdering
            }}
        >
            {children}
        </CustomersContext.Provider>
    )
}

export const useDashboardContext = () => {
    const context = useContext(CustomersContext);
    if (!context) {
        throw new Error(
            'useDashboardContext must be used within a DashboardProvider'
        );
    }
    return context;
};

export enum OrderingRanking {
    TOTAL = "total",
    RESERVATIONS = "reservations",
}

function sortAndLimitRanking<T extends Record<string, any>>(
    rows: T[],
    ordering: OrderingRanking,
    limit: number,
): T[] {
    return [...rows]
        .sort((a, b) => (b[ordering] ?? 0) - (a[ordering] ?? 0))
        .slice(0, limit);
}
