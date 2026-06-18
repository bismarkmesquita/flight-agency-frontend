import { APIResponse, usePrivateAPI } from "@/base/services/api";
import { AxiosInstance } from "axios";
import { useMemo } from "react";
import { User } from "@/auth/models/user";
import { SupplierForm, UserForm } from "../models/forms";
import { Supplier } from "@/management/models/supplier";

class ManagementService {
    constructor(private privateAPI: AxiosInstance) { }

    async fetchUsers() {
        interface Response {
            users: User[];
        }
        const response = await this.privateAPI.get<APIResponse<Response>>('/auth/users/');
        return response.data;
    }

    async createUser(data: UserForm) {
        interface Response {
            user: User;
        }
        const payload = {
            ...data
        };
        const response = await this.privateAPI.post<APIResponse<Response>>(
            '/auth/create/',
            payload
        );
        return response.data;
    }

    async updateUser(data: UserForm, id: number) {
        interface Response {
            user: User;
        }
        const payload = {
            ...data,
        };
        const response = await this.privateAPI.put<APIResponse<Response>>(
            `/auth/update/${id}/`,
            payload
        );
        return response.data;
    }

    async fetchSuppliers() {
        interface Response {
            suppliers: Supplier[];
        }
        const response = await this.privateAPI.get<APIResponse<Response>>('/agency/suppliers/');
        return response.data;
    }

    async createSupplier(data: SupplierForm) {
        interface Response {
            supplier: Supplier;
        }
        const response = await this.privateAPI.post<APIResponse<Response>>(
            '/agency/suppliers/create/',
            data
        );
        return response.data;
    }

    async updateSupplier(data: SupplierForm, id: number) {
        interface Response {
            supplier: Supplier;
        }
        const response = await this.privateAPI.put<APIResponse<Response>>(
            `/agency/suppliers/${id}/`,
            data
        );
        return response.data;
    }
}

export function useManagementService() {
    const privateAPI = usePrivateAPI();
    const service = useMemo(() => new ManagementService(privateAPI), [privateAPI]);
    return service;
}
