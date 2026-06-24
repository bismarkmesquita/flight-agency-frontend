import { User } from '@/auth/models/user';
import { Supplier } from '@/management/models/supplier';
import { CreateReservationForm } from '@/reservations/models/forms';
import { Autocomplete, TextField } from '@mui/material';
import { Control, Controller, FieldErrors } from 'react-hook-form';

const LOCATOR_MAX_LENGHT: number = 20;

export function LocatorInput({
  control,
  errors,
}: {
  control: Control<CreateReservationForm>;
  errors: FieldErrors<CreateReservationForm>;
}) {
  return (
    <Controller
      name='locator'
      control={control}
      rules={{
        required: 'Locator is required.',
        maxLength: {
          value: LOCATOR_MAX_LENGHT,
          message: `Maximum of ${LOCATOR_MAX_LENGHT} characters.`,
        },
       }}
      render={({ field }) => (
        <TextField
          variant='outlined'
          fullWidth
          size='small'
          label='Locator'
          value={field.value ?? ''}
          onChange={field.onChange}
          error={!!errors.locator}
          helperText={
            errors.locator?.message ?? `${field.value?.length ?? 0}/${LOCATOR_MAX_LENGHT} characters.`
          }
          slotProps={{ htmlInput: { maxLength: LOCATOR_MAX_LENGHT } }}
        >
        </TextField>
      )}
    />
  );
}

export function PassengerCountInput({
  control,
  errors,
}: {
  control: Control<CreateReservationForm>;
  errors: FieldErrors<CreateReservationForm>;
}) {
  return (
    <Controller
      name='passenger_count'
      control={control}
      rules={{
        required: 'Passenger count is required.',
        min: {
          value: 1,
          message: "The quantity must be greater than zero.",
        }
      }}
      render={({ field }) => (
        <TextField
          type='number'
          variant='outlined'
          fullWidth
          size='small'
          label='Passenger count'
          value={field.value ?? ''}
          slotProps={
            { htmlInput: { min: 1 } }
          }
          onChange={(e) => field.onChange(Number(e.target.value))}
          error={!!errors.passenger_count}
          helperText={errors.passenger_count?.message}
        >
        </TextField>
      )}
    />
  );
}

export function PassengersInput({
  control,
  errors,
}: {
  control: Control<CreateReservationForm>;
  errors: FieldErrors<CreateReservationForm>;
}) {
  return (
    <Controller
      name='passengers'
      control={control}
      render={({ field }) => (
        <TextField
          variant='outlined'
          fullWidth
          size='small'
          label='Passengers (optional)'
          value={field.value ?? ''}
          onChange={field.onChange}
          error={!!errors.passengers}
          helperText={errors.passengers?.message}
        >
        </TextField>
      )}
    />
  );
}

export function SupplierInput({
  control,
  errors,
  suppliers,
}: {
  control: Control<CreateReservationForm>;
  errors: FieldErrors<CreateReservationForm>;
  suppliers: Supplier[];
}) {
  return (
    <Controller
      name='supplier_id'
      control={control}
      rules={{ required: 'Supplier is required.' }}
      render={({ field }) => (
        <Autocomplete
          fullWidth
          options={suppliers}
          getOptionLabel={(option) => option.name}
          value={suppliers.find(s => s.id === field.value) || null}
          onChange={(_, newValue) => field.onChange(newValue?.id ?? null)}
          renderInput={(params) => (
            <TextField
              {...params}
              size='small'
              label='Supplier'
              variant='outlined'
              error={!!errors.supplier_id}
              helperText={errors.supplier_id?.message}
            />
          )}
        />
      )}
    />
  );
}

export function IssuerInput({
  control,
  errors,
  issuers
}: {
  control: Control<CreateReservationForm>;
  errors: FieldErrors<CreateReservationForm>;
  issuers: User[];
}) {
  return (
    <Controller
      name='issuer_id'
      control={control}
      rules={{ required: 'Issuer is required.' }}
      render={({ field }) => (
        <Autocomplete
          fullWidth
          options={issuers}
          getOptionLabel={(option) => option.name}
          value={issuers.find(s => s.id === field.value) || null}
          onChange={(_, newValue) => field.onChange(newValue?.id ?? null)}
          renderInput={(params) => (
            <TextField
              {...params}
              size='small'
              label='Issuer'
              variant='outlined'
              error={!!errors.issuer_id}
              helperText={errors.issuer_id?.message}
            />
          )}
        />
      )}
    />
  );
}
