"use client";

import { Customer } from "@/customers/models/customer";
import { Flight } from "@/flights/models/flight";
import { createContext, ReactNode, useContext, useState } from "react";
import { CreateReservationForm, CreateSaleForm } from "../models/forms";

interface ReservationStepperContextType {
    steps: string[];
    activeStep: number;

    selectedFlights: Flight[];
    setSelectedFlights: (flights: Flight[]) => void;

    selectedCustomer: Customer | null;
    setSelectedCustomer: (customer: Customer | null) => void;

    reservationData: CreateReservationForm | null;
    setReservationData: (form: CreateReservationForm | null) => void;

    saleData: CreateSaleForm | null;
    setSaleData: (form: CreateSaleForm | null) => void;

    handleNext: () => void;
    handleBack: () => void;

    resetReservationStepper: () => void;
}

const ReservationStepperContext = createContext<ReservationStepperContextType | null>(null);

export function ReservationStepperProvider({ children }: { children: ReactNode }) {
    const steps = ["Flight Data", "Customer Data", "Sale Data", "Reservation Data", "Confirm Data"];
    const [activeStep, setActiveStep] = useState<number>(0);
    const [selectedFlights, setSelectedFlights] = useState<Flight[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [reservationData, setReservationData] = useState<CreateReservationForm | null>(null);
    const [saleData, setSaleData] = useState<CreateSaleForm | null>(null);

    const handleNext = () => {
        if (activeStep < steps.length - 1) {
            setActiveStep((prev) => prev + 1);
        };
    }

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const resetReservationStepper = () => {
        setSelectedFlights([]);
        setSelectedCustomer(null);
        setReservationData(null);
        setSaleData(null);
        setActiveStep(0);
    }

    return (
        <ReservationStepperContext.Provider
            value={{
                steps,
                activeStep,
                selectedFlights,
                setSelectedFlights,
                selectedCustomer,
                setSelectedCustomer,
                reservationData,
                setReservationData,
                saleData,
                setSaleData,
                handleNext,
                handleBack,
                resetReservationStepper
            }}
        >
            {children}
        </ReservationStepperContext.Provider>
    )
}

export const useReservationStepperContext = () => {
    const context = useContext(ReservationStepperContext);
    if (!context) {
        throw new Error(
            'useReservationStepperContext must be used within a ReservationStepperProvider'
        );
    }
    return context;
}