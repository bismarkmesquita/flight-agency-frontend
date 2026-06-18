import { APIResponse, useFrontendPagination, usePrivateAPI } from "@/base/services/api";
import { Customer } from "@/customers/models/customer";
import { AxiosInstance } from "axios";
import { useMemo } from "react";

class CustomerService {
    constructor(private privateAPI: AxiosInstance) { }

    async createCustomer(data: Customer) {
        interface Response {
            customer: Customer;
        }
        const payload = {
            ...data
        };
        const response = await this.privateAPI.post<APIResponse<Response>>(
            '/agency/customers/',
            payload
        );
        return response.data;
    }

    async updateCustomer(data: Customer, id: number) {
        interface Response {
            customer: Customer;
        }
        const payload = {
            ...data
        };
        const response = await this.privateAPI.put<APIResponse<Response>>(
            `/agency/customers/${id}/`,
            payload
        );
        return response.data;
    }
}

export function useCustomerService() {
    const privateAPI = usePrivateAPI();
    const service = useMemo(() => new CustomerService(privateAPI), [privateAPI]);
    return service;
}

export function usePaginatedCustomers() {
    return useFrontendPagination<Customer>({
        url: '/agency/customers/',
        pageSize: 10,
    });
}
