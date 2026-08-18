import style from "../create-reservation-dialog.module.scss";
import { Button } from "@mui/material";
import { CreateSaleForm } from "@/reservations/models/forms";
import { useForm } from "react-hook-form";
import { useReservationStepperContext } from "@/reservations/providers/reservation-stepper-context";
import { useManagementContext } from "@/management/providers/management-context";
import { useEffect } from "react";
import {
    CostInput,
    IndicationInput,
    PaymentInput,
    ReceivedInput,
    SellerInput,
    TypeInput,
} from "../sale-section/sale-inputs";
import { DateInput } from "@/base/components/date-input/date-input";

export default function SaleSectionForm() {
    const { handleBack } = useReservationStepperContext();
    const { users } = useManagementContext();
    const {
        selectedCustomer,
        saleData,
        setSaleData,
        handleNext
    } = useReservationStepperContext();

    const {
        control: saleControl,
        formState: { errors: saleErrors },
        getValues,
        setValue,
        trigger,
    } = useForm<CreateSaleForm>({});

    useEffect(() => {
        if (!saleData) return;
        setValue("payment", saleData.payment);
        setValue("seller_id", saleData.seller_id);
        setValue("amount_received", saleData.amount_received);
        setValue("cost", saleData.cost);
        setValue("sale_date", saleData.sale_date);
        setValue("type", saleData.type);
        setValue("indication", saleData.indication ?? "");
        setValue("customer_id", saleData.customer_id);
    }, [saleData]);

    const handleConfirmAndNext = async () => {
        const valid = await trigger();
        if (!valid || !selectedCustomer) {
            return;
        }

        const formValues = getValues();

        const payload: CreateSaleForm = {
            ...formValues,
            customer_id: selectedCustomer.id,
        };

        setSaleData(payload);

        handleNext();
    }

    return (
        <div className={style.sale}>
            <h3>Sale Details</h3>
            <div className={style.inputs}>
                <div className={style.couple}>
                    <IndicationInput
                        control={saleControl}
                        errors={saleErrors}
                    />
                </div>
                <div className={style.couple}>
                    <SellerInput
                        control={saleControl}
                        errors={saleErrors}
                        sellers={users}
                    />
                    <PaymentInput
                        control={saleControl}
                        errors={saleErrors}
                    />
                </div>
                <div className={style.couple}>
                    <ReceivedInput
                        control={saleControl}
                        errors={saleErrors}
                    />
                    <CostInput
                        control={saleControl}
                        errors={saleErrors}
                    />
                </div>
                <div className={style.couple}>
                    <DateInput<CreateSaleForm>
                        control={saleControl}
                        errors={saleErrors}
                        name="sale_date"
                        label="Sale date"
                    />
                    <TypeInput
                        control={saleControl}
                        errors={saleErrors}
                    />
                </div>
            </div>
            <div className={style.actions}>
                <Button onClick={handleBack} variant="outlined">
                    Back
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleConfirmAndNext}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
