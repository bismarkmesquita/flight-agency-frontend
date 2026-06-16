import { SupplierForm } from '@/management/models/forms';
import { TextField } from '@mui/material';
import { Control, Controller, FieldErrors } from 'react-hook-form';

const NAME_MAX_LENGTH: number = 250;
const COUNTRY_MAX_LENGTH: number = 100;
const CITY_MAX_LENGTH: number = 100;
const STATE_MAX_LENGTH: number = 100;
const PHONE_MAX_LENGHT: number = 20;
const POSTAL_CODE_MAX_LENGHT: number = 20;

export function NameInput({
    control,
    errors,
    disabled = false,
}: {
    control: Control<SupplierForm>;
    errors: FieldErrors<SupplierForm>;
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
                    message: `Maximum ${NAME_MAX_LENGTH} characters`,
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
                        errors.name?.message ?? `${field.value?.length ?? 0}/${NAME_MAX_LENGTH} characters`
                    }
                    slotProps={{ htmlInput: { maxLength: NAME_MAX_LENGTH } }}
                />
            )}
        />
    );
}

export function PhoneInput({
    control,
    errors,
    disabled = false,
}: {
    control: Control<SupplierForm>;
    errors: FieldErrors<SupplierForm>;
    disabled?: boolean;
}) {
    return (
        <Controller
            name='phone'
            control={control}
            rules={{
                required: 'Phone is required.',
                maxLength: {
                    value: PHONE_MAX_LENGHT,
                    message: `Maximum ${PHONE_MAX_LENGHT} characters`,
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
                    onChange={(e) => {
                        field.onChange(e.target.value);
                    }}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                >
                </TextField>
            )}
        />
    );
}

export function TaxIdInput({
    control,
    errors,
    disabled = false,
}: {
    control: Control<SupplierForm>;
    errors: FieldErrors<SupplierForm>;
    disabled?: boolean;
}) {
    return (
        <Controller
            name='tax_id'
            control={control}
            render={({ field }) => (
                <TextField
                    variant='outlined'
                    fullWidth
                    disabled={disabled}
                    size='small'
                    label='Tax ID'
                    inputMode="numeric"
                    value={field.value ?? ''}
                    onChange={(e) => {
                        field.onChange(e.target.value);
                    }}
                    error={!!errors.tax_id}
                    helperText={errors.tax_id?.message}
                >
                </TextField>
            )}
        />
    );
}

export function PostalCodeInput({
    control,
    errors,
    disabled = false,
}: {
    control: Control<SupplierForm>;
    errors: FieldErrors<SupplierForm>;
    disabled?: boolean;
}) {
    return (
        <Controller
            name='postal_code'
            control={control}
            rules={{
                required: 'Postal Code is required.',
                maxLength: {
                    value: POSTAL_CODE_MAX_LENGHT,
                    message: `Maximum ${POSTAL_CODE_MAX_LENGHT} characters`,
                },
            }}
            render={({ field }) => (
                <TextField
                    variant='outlined'
                    fullWidth
                    disabled={disabled}
                    size='small'
                    label='Postal Code'
                    inputMode="numeric"
                    value={field.value ?? ''}
                    slotProps={{
                        htmlInput: { maxLength: 9 }
                    }}
                    onChange={(e) => {
                        field.onChange(e.target.value);
                    }}
                    error={!!errors.postal_code}
                    helperText={errors.postal_code?.message}
                >
                </TextField>
            )}
        />
    );
}

export function CountryInput({
    control,
    errors,
    disabled = false,
}: {
    control: Control<SupplierForm>;
    errors: FieldErrors<SupplierForm>;
    disabled?: boolean;
}) {
    return (
        <Controller
            name='country'
            control={control}
            rules={{
                required: 'Country is required.',
            }}
            render={({ field }) => (
                <TextField
                    variant='outlined'
                    fullWidth
                    disabled={disabled}
                    size='small'
                    label='Country'
                    value={field.value ?? ''}
                    slotProps={{
                        htmlInput: { maxLength: COUNTRY_MAX_LENGTH }
                    }}
                    onChange={field.onChange}
                    error={!!errors.country}
                    helperText={errors.country?.message}
                >
                </TextField>
            )}
        />
    );
}

export function CityInput({
    control,
    errors,
    disabled = false,
}: {
    control: Control<SupplierForm>;
    errors: FieldErrors<SupplierForm>;
    disabled?: boolean;
}) {
    return (
        <Controller
            name='city'
            control={control}
            rules={{
                required: 'City is required.',
            }}
            render={({ field }) => (
                <TextField
                    variant='outlined'
                    fullWidth
                    disabled={disabled}
                    size='small'
                    label='City'
                    value={field.value ?? ''}
                    slotProps={{
                        htmlInput: { maxLength: CITY_MAX_LENGTH }
                    }}
                    onChange={field.onChange}
                    error={!!errors.city}
                    helperText={errors.city?.message}
                >
                </TextField>
            )}
        />
    );
}

export function StateInput({
    control,
    errors,
    disabled = false,
}: {
    control: Control<SupplierForm>;
    errors: FieldErrors<SupplierForm>;
    disabled?: boolean;
}) {
    return (
        <Controller
            name='state'
            control={control}
            rules={{
                required: 'State is required.',
            }}
            render={({ field }) => (
                <TextField
                    variant='outlined'
                    fullWidth
                    disabled={disabled}
                    size='small'
                    label='State'
                    value={field.value ?? ''}
                    slotProps={{
                        htmlInput: { maxLength: STATE_MAX_LENGTH }
                    }}
                    onChange={field.onChange}
                    error={!!errors.state}
                    helperText={errors.state?.message}
                >
                </TextField>
            )}
        />
    );
}

export function NeighborhoodInput({
    control,
    errors,
    disabled = false,
}: {
    control: Control<SupplierForm>;
    errors: FieldErrors<SupplierForm>;
    disabled?: boolean;
}) {
    return (
        <Controller
            name='neighborhood'
            control={control}
            rules={{
                required: 'Bairro is required.',
            }}
            render={({ field }) => (
                <TextField
                    variant='outlined'
                    fullWidth
                    disabled={disabled}
                    size='small'
                    label='Bairro'
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    error={!!errors.neighborhood}
                    helperText={errors.neighborhood?.message}
                >
                </TextField>
            )}
        />
    );
}

export function AddressInput({
    control,
    errors,
    disabled = false,
}: {
    control: Control<SupplierForm>;
    errors: FieldErrors<SupplierForm>;
    disabled?: boolean;
}) {
    return (
        <Controller
            name='address'
            control={control}
            rules={{
                required: 'Address is required.',
            }}
            render={({ field }) => (
                <TextField
                    variant='outlined'
                    fullWidth
                    disabled={disabled}
                    size='small'
                    label='Address'
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    error={!!errors.address}
                    helperText={errors.address?.message}
                >
                </TextField>
            )}
        />
    );
}

export function AddressNumberInput({
    control,
    errors,
    disabled = false,
}: {
    control: Control<SupplierForm>;
    errors: FieldErrors<SupplierForm>;
    disabled?: boolean;
}) {
    return (
        <Controller
            name='address_number'
            control={control}
            rules={{
                required: 'Address Number is required.',
            }}
            render={({ field }) => (
                <TextField
                    variant='outlined'
                    fullWidth
                    disabled={disabled}
                    size='small'
                    label='Address Number'
                    inputMode="tel"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    error={!!errors.address_number}
                    helperText={errors.address_number?.message}
                >
                </TextField>
            )}
        />
    );
}

export function ComplementInput({
    control,
    errors,
    disabled = false,
}: {
    control: Control<SupplierForm>;
    errors: FieldErrors<SupplierForm>;
    disabled?: boolean;
}) {
    return (
        <Controller
            name='complement'
            control={control}
            render={({ field }) => (
                <TextField
                    variant='outlined'
                    fullWidth
                    disabled={disabled}
                    size='small'
                    label='Complement'
                    inputMode="tel"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    error={!!errors.complement}
                    helperText={errors.complement?.message}
                >
                </TextField>
            )}
        />
    );
}
