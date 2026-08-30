import { User } from '@/auth/models/user';
import { formatDateInput, formatMoney } from '@/base/utils/format-inputs';
import { CreateSaleForm } from '@/reservations/models/forms';
import { PAYMENT_METHOD_LABELS, PaymentMethod, SALE_TYPE_LABELS, SaleType } from '@/reservations/models/sale';
import { Autocomplete, MenuItem, TextField } from '@mui/material';
import { Control, Controller, FieldErrors } from 'react-hook-form';

const INDICATION_MAX_LENGHT: number = 200;

export function SellerInput({
  control,
  errors,
  sellers,
}: {
  control: Control<CreateSaleForm>;
  errors: FieldErrors<CreateSaleForm>;
  sellers: User[];
}) {
  return (
    <Controller
      name='seller_id'
      control={control}
      rules={{ required: 'Seller is required.' }}
      render={({ field }) => (
        <Autocomplete
          fullWidth
          options={sellers}
          getOptionLabel={(option) => option.name}
          value={sellers.find(s => s.id === field.value) || null}
          onChange={(_, newValue) => field.onChange(newValue?.id ?? null)}
          renderInput={(params) => (
            <TextField
              {...params}
              size='small'
              label='Seller'
              variant='outlined'
              error={!!errors.seller_id}
              helperText={errors.seller_id?.message}
            />
          )}
        />
      )}
    />
  );
}

export const paymentOptions = Object.entries(PAYMENT_METHOD_LABELS).map(
  ([value, label]) => ({
    value: value as PaymentMethod,
    label,
  })
);

export function PaymentInput({
  control,
  errors,
}: {
  control: Control<CreateSaleForm>;
  errors: FieldErrors<CreateSaleForm>;
}) {
  return (
    <Controller
      name='payment'
      control={control}
      rules={{ required: 'Payment is required.' }}
      render={({ field }) => (
        <TextField
          select
          variant='outlined'
          fullWidth
          size='small'
          label='Payment'
          value={field.value ?? ''}
          onChange={field.onChange}
          error={!!errors.payment}
          helperText={errors.payment?.message}
        >
          {paymentOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}

export const typeOptions = Object.entries(SALE_TYPE_LABELS).map(
  ([value, label]) => ({
    value: value as SaleType,
    label,
  })
);

export function TypeInput({
  control,
  errors,
}: {
  control: Control<CreateSaleForm>;
  errors: FieldErrors<CreateSaleForm>;
}) {
  return (
    <Controller
      name='type'
      control={control}
      rules={{ required: 'Type is required.' }}
      render={({ field }) => (
        <TextField
          select
          variant='outlined'
          fullWidth
          size='small'
          label='Type'
          value={field.value ?? ''}
          onChange={field.onChange}
          error={!!errors.type}
          helperText={errors.type?.message}
        >
          {typeOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}

export function ReceivedInput({
  control,
  errors,
}: {
  control: Control<CreateSaleForm>;
  errors: FieldErrors<CreateSaleForm>;
}) {
  return (
    <Controller
      name='amount_received'
      control={control}
      rules={{ required: 'Amount received is required.' }}
      render={({ field }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          const numeric = value.replace(/\D/g, "");
          const asNumber = Number(numeric) / 100;
          field.onChange(asNumber);
        };

        return (
          <TextField
            variant="outlined"
            fullWidth
            size="small"
            label="Amount received"
            value={
              field.value !== null && field.value !== undefined
                ? formatMoney(field.value)
                : ""
            }
            onChange={handleChange}
            error={!!errors.amount_received}
            helperText={errors.amount_received?.message}
            inputMode="numeric"
          />
        );
      }}
    />
  );
}

export function CostInput({
  control,
  errors,
}: {
  control: Control<CreateSaleForm>;
  errors: FieldErrors<CreateSaleForm>;
}) {
  return (
    <Controller
      name='cost'
      control={control}
      rules={{ required: 'Cost is required.' }}
      render={({ field }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          const numeric = value.replace(/\D/g, "");
          const asNumber = Number(numeric) / 100;
          field.onChange(asNumber);
        };

        return (
          <TextField
            variant="outlined"
            fullWidth
            size="small"
            label="Cost"
            value={
              field.value !== null && field.value !== undefined
                ? formatMoney(field.value)
                : ""
            }
            onChange={handleChange}
            error={!!errors.cost}
            helperText={errors.cost?.message}
            inputMode="numeric"
          />
        );
      }}
    />
  );
}

export function IndicationInput({
  control,
  errors,
}: {
  control: Control<CreateSaleForm>;
  errors: FieldErrors<CreateSaleForm>;
}) {
  return (
    <Controller
      name='indication'
      control={control}
      rules={{
        maxLength: {
          value: INDICATION_MAX_LENGHT,
          message: `Maximum of ${INDICATION_MAX_LENGHT} characters.`,
        },
      }}
      render={({ field }) => (
        <TextField
          variant='outlined'
          fullWidth
          size='small'
          label='Indication (optional)'
          value={field.value ?? ''}
          onChange={field.onChange}
          error={!!errors.indication}
          helperText={
            errors.indication?.message ?? `${field.value?.length ?? 0}/${INDICATION_MAX_LENGHT} characters.`
          }
          slotProps={{ htmlInput: { maxLength: INDICATION_MAX_LENGHT } }}
        >
        </TextField>
      )}
    />
  );
}

export function SaleDateInput({
  control,
  errors,
}: {
  control: Control<CreateSaleForm>;
  errors: FieldErrors<CreateSaleForm>;
}) {
  return (
    <Controller
      name='sale_date'
      control={control}
      render={({ field }) => (
        <TextField
          variant='outlined'
          fullWidth
          type='date'
          size='small'
          label='Sale date'
          slotProps={
            { inputLabel: { shrink: true } }
          }
          value={formatDateInput(field.value)}
          onChange={field.onChange}
          error={!!errors.sale_date}
          helperText={errors.sale_date?.message}
        >
        </TextField>
      )}
    />
  );
}
