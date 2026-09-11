"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { SupplierForm, UserForm } from "../models/forms";
import { APIResponse } from "@/base/services/api";
import { User } from "@/auth/models/user";
import { useManagementService } from "../services/management";
import { Supplier } from "../models/supplier";

interface ManagementContextType {
    users: User[];
    createUser: (data: UserForm) => Promise<APIResponse<User>>;
    updateUser: (data: UserForm, id: number) => Promise<APIResponse<User>>;

    suppliers: Supplier[];
    createSupplier: (data: SupplierForm) => Promise<APIResponse<Supplier>>;
    updateSupplier: (data: SupplierForm, id: number) => Promise<APIResponse<Supplier>>;
}

const ManagementContext = createContext<ManagementContextType | null>(null);

export function ManagementProvider({ children }: { children: ReactNode }) {
    const managementService = useManagementService();
    const [users, setUsers] = useState<User[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);

    useEffect(() => {
        fetchUsers();
        fetchSuppliers();
    }, [])

    const fetchUsers = async () => {
        const response = await managementService.fetchUsers();
        if (response.success) {
            setUsers(response.data ?? []);
        } else {
            console.error(response.message)
        }
    }

    const createUser = async (data: UserForm) => {
        const response = await managementService.createUser(data);

        if (response.success) {
            setUsers(prev => [...prev, response.data!]);
        }

        return response;
    };

    const updateUser = async (data: UserForm, id: number) => {
        const response = await managementService.updateUser(data, id);

        if (response.success) {
            setUsers(prev =>
                prev.map(s =>
                    s.id === id ? response.data! : s
                )
            );
        }

        return response;
    };

    const fetchSuppliers = async () => {
        const response = await managementService.fetchSuppliers();
        if (response.success) {
            setSuppliers(response.data ?? []);
        } else {
            console.error(response.message)
        }
    }

    const createSupplier = async (data: SupplierForm) => {
        const response = await managementService.createSupplier(data);

        if (response.success) {
            setSuppliers(prev => [...prev, response.data!]);
        }

        return response;
    };

    const updateSupplier = async (data: SupplierForm, id: number) => {
        const response = await managementService.updateSupplier(data, id);

        if (response.success) {
            setSuppliers(prev =>
                prev.map(s =>
                    s.id === id ? response.data! : s
                )
            );
        }

        return response;
    };

    return (
        <ManagementContext.Provider
            value={{
                users,
                createUser,
                updateUser,
                suppliers,
                createSupplier,
                updateSupplier,
            }}
        >
            {children}
        </ManagementContext.Provider>
    )
}

export const useManagementContext = () => {
    const context = useContext(ManagementContext);
    if (!context) {
        throw new Error(
            'useManagementContext must be used within a ManagementProvider'
        );
    }
    return context;
};
