import { Customer } from '@/customers/models/customer';
import { Autocomplete, TextField } from '@mui/material';
import { Control, Controller, FieldErrors } from 'react-hook-form';

const NAME_MAX_LENGTH: number = 250;
const EMAIL_MAX_LENGTH: number = 200;
const PHONE_MAX_LENGTH: number = 15;

export function CustomerInput({
    customers,
    setSelectedCustomer,
}: {
    control: Control<Customer>;
    errors: FieldErrors<Customer>;
    customers: Customer[];
    selectedCustomer: Customer | null;
    setSelectedCustomer: (costumer: Customer | null) => void;
}) {
    return (
        <Autocomplete
            fullWidth
            options={customers}
            getOptionLabel={(option) => `${option.name} - ${option.email}`}
            onChange={(_, newValue) => {
                setSelectedCustomer(newValue);
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    size='small'
                    label='Name or E-mail'
                    variant='outlined'
                />
            )}
        />
    );
}

export function NameInput({
    control,
    errors,
    disabled = false,
}: {
    control: Control<Customer>;
    errors: FieldErrors<Customer>;
    disabled?: boolean;
}) {
    return (
        <Controller
            name='name'
            control={control}
            rules={{
                required: 'Name is required.',
                maxLength: {
                    value: NAME_MAX_LENGTH,
                    message: `Maximum of ${NAME_MAX_LENGTH} characters`,
                },
            }}
            render={({ field }) => (
                <TextField
                    variant='outlined'
                    fullWidth
                    disabled={disabled}
                    size='small'
                    label='Name'
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    error={!!errors.name}
                    helperText={
                        errors.name?.message ??
                        `${field.value?.length ?? 0}/${NAME_MAX_LENGTH} characters`
                    }
                    slotProps={{ htmlInput: { maxLength: NAME_MAX_LENGTH } }}
                />
            )}
        />
    );
}

export function EmailInput({
    control,
    errors,
    disabled = false,
}: {
    control: Control<Customer>;
    errors: FieldErrors<Customer>;
    disabled?: boolean;
}) {
    return (
        <Controller
            name='email'
            control={control}
            rules={{
                required: 'E-mail is required.',
                maxLength: {
                    value: EMAIL_MAX_LENGTH,
                    message: `Maximum of ${EMAIL_MAX_LENGTH} characters`,
                },
            }}
            render={({ field }) => (
                <TextField
                    variant='outlined'
                    fullWidth
                    disabled={disabled}
                    size='small'
                    label='E-mail'
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    error={!!errors.email}
                    helperText={
                        errors.email?.message ??
                        `${field.value?.length ?? 0}/${EMAIL_MAX_LENGTH} characters`
                    }
                    slotProps={{ htmlInput: { maxLength: EMAIL_MAX_LENGTH } }}
                >
                </TextField>
            )}
        />
    );
}

export function PhoneInput({
    control,
    errors,
    disabled = false,
}: {
    control: Control<Customer>;
    errors: FieldErrors<Customer>;
    disabled?: boolean;
}) {
    return (
        <Controller
            name='phone'
            control={control}
            rules={{
                required: 'Phone is required.',
                maxLength: {
                    value: PHONE_MAX_LENGTH,
                    message: `Maximum of ${PHONE_MAX_LENGTH} characters`,
                },
            }}
            render={({ field }) => (
                <TextField
                    variant='outlined'
                    fullWidth
                    disabled={disabled}
                    size='small'
                    label='Phone'
                    inputMode="tel"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    error={!!errors.phone}
                    helperText={
                        errors.phone?.message ??
                        `${field.value?.length ?? 0}/${PHONE_MAX_LENGTH} characters`
                    }
                    slotProps={{ htmlInput: { maxLength: PHONE_MAX_LENGTH } }}
                >
                </TextField>
            )}
        />
    );
}