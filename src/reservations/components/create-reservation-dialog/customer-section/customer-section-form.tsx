import { Button, Chip, Divider } from "@mui/material";
import style from "../create-reservation-dialog.module.scss";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSnackbar } from "@/base/context/SnackbarContext";
import { CustomerInput, EmailInput, NameInput, PhoneInput } from "./customer-inputs";
import { useCustomersContext } from "@/customers/providers/customers-context";
import { useReservationStepperContext } from "@/reservations/providers/reservation-stepper-context";
import { Customer } from "@/customers/models/customer";

export default function CustomerSectionForm() {
    const { showSnackbar } = useSnackbar();
    const { handleNext, handleBack } = useReservationStepperContext();
    const { filteredCustomers, createCustomer } = useCustomersContext();
    const { selectedCustomer, setSelectedCustomer } = useReservationStepperContext();

    const {
        control: customerControl,
        formState: { errors: customerErrors },
        setValue,
        getValues,
        trigger,
    } = useForm<Customer>({
        defaultValues: {},
    });

    useEffect(() => {
        if (!selectedCustomer) return;

        setValue("name", selectedCustomer.name ?? "");
        setValue("email", selectedCustomer.email ?? "");
        setValue("phone", selectedCustomer.phone ?? "");
    }, [selectedCustomer]);

    const handleCreateCustomerOrNext = async () => {
        if (selectedCustomer) {
            handleNext();
            return;
        }

        const valid = await trigger();
        if (!valid) {
            return;
        }

        const formValues = getValues();
        const response = await createCustomer(formValues);

        if (!response.success) {
            showSnackbar(response.message ?? "", "error");
            return;
        }

        const createdCustomer = response.customer;
        setSelectedCustomer(createdCustomer);

        handleNext();
        showSnackbar("Customer added successfully.", "success");
    }

    return (
        <div className={style.customer}>
            <h3>Looking for customers</h3>
            <div className={style.inputs}>
                <CustomerInput
                    control={customerControl}
                    errors={customerErrors}
                    customers={filteredCustomers}
                    selectedCustomer={selectedCustomer}
                    setSelectedCustomer={setSelectedCustomer}
                />
            </div>
            <Divider>
                <Chip label="Customer data" variant="outlined" size="small"/>
            </Divider>
            <div className={style.inputs}>
                <NameInput
                    control={customerControl}
                    errors={customerErrors}
                    disabled={!!selectedCustomer}
                />
                <EmailInput
                    control={customerControl}
                    errors={customerErrors}
                    disabled={!!selectedCustomer}
                />
                <PhoneInput
                    control={customerControl}
                    errors={customerErrors}
                    disabled={!!selectedCustomer}
                />
            </div>
            <div className={style.actions}>
                <Button onClick={handleBack} variant="outlined">
                    Voltar
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCreateCustomerOrNext}
                >
                    {selectedCustomer ? "Next" : "Register customer"}
                </Button>
            </div>
        </div>
    )
}
