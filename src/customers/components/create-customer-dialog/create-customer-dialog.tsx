import style from "./create-customer-dialog.module.scss";
import { useForm } from "react-hook-form";
import { Button, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import { Customer } from "@/customers/models/customer";
import { useEffect, useState } from "react";
import { useSnackbar } from "@/base/context/SnackbarContext";
import { LoadingWrapper } from "@/base/components/loading-wrapper/loading-wrapper";
import { useCustomersContext } from "@/customers/providers/customers-context";
import { EmailInput, NameInput, PhoneInput } from "./customer-inputs";

type Props = {
    open: boolean;
    onClose: () => void;
    customer: Customer | null;
}

export default function CreateOrEditCustomerDialog({ open, onClose, customer }: Props) {
    const [loading, setLoading] = useState(false);
    const snackbar = useSnackbar();
    const { createCustomer, updateCustomer } = useCustomersContext();

    const {
        control: customerControl,
        handleSubmit,
        formState: { errors: customerErrors },
        reset: resetForm,
    } = useForm<Customer>({
        defaultValues: {},
    });

    useEffect(() => {
        if (customer) {
            resetForm({
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
            });
        } else {
            resetForm({
                name: '',
                email: '',
                phone: '',
            });
        }
    }, [customer, open, resetForm]);

    const handleUpdateCustomer = async (data: Customer) => {
        setLoading(true);

        const action = customer
            ? updateCustomer(data, customer.id)
            : createCustomer(data)

        const response = await action;
        setLoading(false);

        if (response.success) {
            snackbar.showSnackbar(
                customer ? 'Customer updated!' : 'Client created!',
                'success'
            );
            onClose();
        } else {
            snackbar.showSnackbar(`${response.message}`, 'error');
        }
    }

    return (
        <Dialog open={open} maxWidth='xs' fullWidth>
            <LoadingWrapper className={style.loading} loading={loading}>
                <DialogTitle className={style.title}>
                    {customer ? "Update client" : "Register customer"}
                    <IconButton
                        color="primary"
                        onClick={onClose}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent className={style.inputs}>
                    <NameInput
                        control={customerControl}
                        errors={customerErrors}
                    />
                    <EmailInput
                        control={customerControl}
                        errors={customerErrors}
                    />
                    <PhoneInput
                        control={customerControl}
                        errors={customerErrors}
                    />
                    <div className={style.actions}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit(handleUpdateCustomer)}
                        >
                            {customer ? "Update client" : "Register customer"}
                        </Button>
                    </div>
                </DialogContent>
            </LoadingWrapper>
        </Dialog>
    )
}
