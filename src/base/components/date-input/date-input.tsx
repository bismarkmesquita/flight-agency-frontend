import { TextField } from '@mui/material';
import {
  Control,
  Controller,
  FieldErrors,
  FieldValues,
  Path,
} from 'react-hook-form';

type DateInputProps<T extends FieldValues> = {
  control: Control<T>;
  errors: FieldErrors<T>;
  name: Path<T>;
  label?: string;
  disabled?: boolean
};

export function DateInput<T extends FieldValues>({
  control,
  errors,
  name,
  label = 'Date',
  disabled = false,
}: DateInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required: 'Date and time are required.',
        validate: (value: unknown) =>
          (value instanceof Date && !isNaN(value.getTime())) || 'Invalid date/time',
      }}
      render={({ field }) => (
        <TextField
          variant='outlined'
          fullWidth
          disabled={disabled}
          size='small'
          label={label}
          type='datetime-local'
          slotProps={
            { inputLabel: { shrink: true } }
          }
          onChange={(e) => {
            const parsed = new Date(e.target.value);
            if (!isNaN(parsed.getTime())) {
              field.onChange(parsed);
            } else {
              field.onChange(null);
            }
          }}
          value={field.value ? formatDateToInput(field.value) : ''}
          error={!!errors.date}
          helperText={(errors[name]?.message as string) || ''}
        />
      )}
    />
  );
}

export function formatDateToInput(date: Date): string {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
}
