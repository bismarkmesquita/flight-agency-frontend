export interface Customer {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    is_active: boolean;
}