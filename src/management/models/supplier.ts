export interface Supplier {
    id: number;
    name: string;
    phone: string;
    postal_code: string;
    country: string;
    city: string;
    state: string;
    neighborhood: string;
    address: string;
    address_number: string;
    tax_id?: string;
    complement?: string;
}