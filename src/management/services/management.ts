import { APIResponse, usePrivateAPI } from "@/base/services/api";
import { AxiosInstance } from "axios";
import { useMemo } from "react";
import { User } from "@/auth/models/user";
import { SupplierForm, UserForm } from "../models/forms";
import { Supplier } from "@/management/models/supplier";

class ManagementService {
    constructor(private privateAPI: AxiosInstance) { }

    async fetchUsers() {
        const response = await this.privateAPI.get<APIResponse<User[]>>('/auth/users/');
        return response.data;
    }

    async createUser(data: UserForm) {
        const payload = {
            ...data
        };
        const response = await this.privateAPI.post<APIResponse<User>>(
            '/auth/create/',
            payload
        );
        return response.data;
    }

    async updateUser(data: UserForm, id: number) {
        const payload = {
            ...data,
        };
        const response = await this.privateAPI.put<APIResponse<User>>(
            `/auth/update/${id}/`,
            payload
        );
        return response.data;
    }

    async fetchSuppliers() {
        const response = await this.privateAPI.get<APIResponse<Supplier[]>>('/agency/suppliers/');
        return response.data;
    }

    async createSupplier(data: SupplierForm) {
        const response = await this.privateAPI.post<APIResponse<Supplier>>(
            '/agency/suppliers/create/',
            data
        );
        return response.data;
    }

    async updateSupplier(data: SupplierForm, id: number) {
        const response = await this.privateAPI.put<APIResponse<Supplier>>(
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
