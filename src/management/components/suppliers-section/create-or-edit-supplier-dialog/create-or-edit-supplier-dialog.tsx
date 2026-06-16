"use client";

import { useForm } from "react-hook-form";
import style from "./create-or-edit-supplier-dialog.module.scss";
import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton
} from "@mui/material";
import { Close, Search } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useSnackbar } from "@/base/context/SnackbarContext";
import { LoadingWrapper } from "@/base/components/loading-wrapper/loading-wrapper";
import { Supplier } from "@/management/models/supplier";
import { useManagementContext } from "@/management/providers/management-context";
import { SupplierForm } from "@/management/models/forms";
import {
    AddressInput,
    AddressNumberInput,
    PostalCodeInput,
    CountryInput,
    CityInput,
    TaxIdInput,
    ComplementInput,
    NameInput,
    NeighborhoodInput,
    PhoneInput,
    StateInput
} from "./supplier-inputs";
import { useIsMobile } from "@/base/styles/hooks";

type Props = {
    open: boolean;
    onClose: () => void;
    supplier: Supplier | null;
}

export default function CreateOrEditSupplierDialog({ open, onClose, supplier }: Props) {
    const [loading, setLoading] = useState(false);
    const snackbar = useSnackbar();
    const { createSupplier, updateSupplier } = useManagementContext();
    const isMobile = useIsMobile();

    const {
        control: supplierControl,
        handleSubmit,
        formState: { errors: supplierErrors },
        reset: resetForm,
    } = useForm<SupplierForm>({
        defaultValues: {},
    });

    useEffect(() => {
        if (supplier) {
            resetForm({
                name: supplier.name,
                phone: supplier.phone,
                tax_id: supplier.tax_id,
                postal_code: supplier.postal_code,
                country: supplier.country,
                city: supplier.city,
                state: supplier.state,
                address: supplier.address,
                address_number: supplier.address_number,
                neighborhood: supplier.neighborhood,
                complement: supplier.complement,
            });
        } else {
            resetForm({
                name: '',
                phone: '',
                tax_id: '',
                country: '',
                postal_code: '',
                city: '',
                state: '',
                address: '',
                address_number: '',
                neighborhood: '',
                complement: '',
            });
        }
    }, [supplier, open, resetForm]);

    const handleUpdateSupplier = async (data: SupplierForm) => {
        setLoading(true);

        const action = supplier
            ? updateSupplier(data, supplier.id)
            : createSupplier(data)

        const response = await action;
        setLoading(false);

        if (response.success) {
            snackbar.showSnackbar(
                supplier ? 'Supplier updated!' : 'Supplier created!',
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
                    {supplier ? "Update supplier" : "Register supplier"}
                    <IconButton
                        color="primary"
                        onClick={onClose}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent className={style.inputs}>
                    <NameInput
                        control={supplierControl}
                        errors={supplierErrors}
                    />
                    <div className={style.couple}>
                        <TaxIdInput
                            control={supplierControl}
                            errors={supplierErrors}
                        />
                        <PhoneInput
                            control={supplierControl}
                            errors={supplierErrors}
                        />
                    </div>
                    <div className={style.couple}>
                        <CountryInput
                            control={supplierControl}
                            errors={supplierErrors}
                        />
                        <PostalCodeInput
                            control={supplierControl}
                            errors={supplierErrors}
                        />
                    </div>
                    <Divider flexItem />
                    <div className={style.couple}>
                        <CityInput
                            control={supplierControl}
                            errors={supplierErrors}
                        />
                        <StateInput
                            control={supplierControl}
                            errors={supplierErrors}
                        />
                    </div>
                    <div className={style.couple}>
                        <AddressInput
                            control={supplierControl}
                            errors={supplierErrors}
                        />
                        <AddressNumberInput
                            control={supplierControl}
                            errors={supplierErrors}
                        />
                    </div>
                    <div className={style.couple}>
                        <NeighborhoodInput
                            control={supplierControl}
                            errors={supplierErrors}
                        />
                        <ComplementInput
                            control={supplierControl}
                            errors={supplierErrors}
                        />
                    </div>
                    <div className={style.actions}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit(handleUpdateSupplier)}
                        >
                            {supplier ? "Update supplier" : "Register supplier"}
                        </Button>
                    </div>
                </DialogContent>
            </LoadingWrapper>
        </Dialog>
    )
}
