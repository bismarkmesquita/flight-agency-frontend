"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { Customer } from "@/customers/models/customer";
import { useCustomerService, usePaginatedCustomers } from "../services/customers";
import { APIResponse } from "@/base/services/api";

interface Response {
    customer: Customer;
}

interface CustomersContextType {
    filteredCustomers: Customer[];
    createCustomer: (data: Customer) => Promise<APIResponse<Response>>;
    updateCustomer: (data: Customer, id: number) => Promise<APIResponse<Response>>;

    searchQuery: string;
    setSearchQuery: (searchQuery: string) => void;

    page: number;
    numPages: number;
    setPage: (page: number) => void;
}

const CustomersContext = createContext<CustomersContextType | null>(null);

export function CustomersProvider({ children }: { children: ReactNode }) {
    const customerService = useCustomerService();
    const paginatedCustomers = usePaginatedCustomers();
    const [searchQuery, setSearchQuery] = useState<string>("");

    const filteredCustomers = useMemo(() => {
        if (!searchQuery.trim()) {
            return paginatedCustomers.items;
        }

        return paginatedCustomers.allItems.filter((customer) => {
            const searchLower = searchQuery.toLowerCase();
            const name = customer.name?.toLowerCase() || '';
            const email = customer.email?.toLowerCase() || '';
            const phone = customer.phone?.toLowerCase() || '';

            const matchesSearch =
                !searchQuery ||
                name.includes(searchLower) ||
                email.includes(searchLower) ||
                phone.includes(searchLower);

            return matchesSearch;
        })
    }, [searchQuery, paginatedCustomers.allItems, paginatedCustomers.items]);

    const createCustomer = async (data: Customer) => {
        const response = await customerService.createCustomer(data);

        if (response.success) {
            paginatedCustomers.addItem(response.customer);
        }

        return response;
    };

    const updateCustomer = async (data: Customer, id: number) => {
        const response = await customerService.updateCustomer(data, id);

        if (response.success) {
            paginatedCustomers.refresh();
        }

        return response;
    };

    return (
        <CustomersContext.Provider
            value={{
                filteredCustomers,
                createCustomer,
                updateCustomer,
                searchQuery,
                setSearchQuery,
                page: paginatedCustomers.page,
                numPages: paginatedCustomers.numPages,
                setPage: paginatedCustomers.setPage,
            }}
        >
            {children}
        </CustomersContext.Provider>
    )
}

export const useCustomersContext = () => {
    const context = useContext(CustomersContext);
    if (!context) {
        throw new Error(
            'useCustomersContext must be used within a CustomersProvider'
        );
    }
    return context;
};
