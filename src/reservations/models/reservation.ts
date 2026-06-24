import { User } from "@/auth/models/user";
import { Flight } from "../../flights/models/flight";
import { Supplier } from "../../management/models/supplier";
import { Sale } from "./sale";

export interface Reservation {
  id: number;
  locator: string;
  sale: Sale;
  flights: Flight[];
  passenger_count: number;
  passengers?: string;
  supplier: Supplier;
  issuer: User;
}