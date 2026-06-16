import { USER_ROLE_TO_LABEL, UserRole } from '@/auth/enums/user-role';
import { UserForm } from '@/management/models/forms';
import { MenuItem, TextField } from '@mui/material';
import { Control, Controller, FieldErrors } from 'react-hook-form';

const NAME_MAX_LENGTH: number = 250;

export function NameInput({
  control,
  errors,
  disabled = false,
}: {
  control: Control<UserForm>;
  errors: FieldErrors<UserForm>;
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

export function EmailInput({
  control,
  errors,
  disabled = false,
}: {
  control: Control<UserForm>;
  errors: FieldErrors<UserForm>;
  disabled?: boolean;
}) {
  return (
    <Controller
      name='email'
      control={control}
      rules={{
        required: 'E-mail is required.',
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
          helperText={errors.email?.message}
        />
      )}
    />
  );
}

export const roleOptions = Object.entries(USER_ROLE_TO_LABEL)
  .filter(([value]) => value !== UserRole.ADMIN)
  .map(
    ([value, label]) => ({
      value: value as UserRole,
      label,
    })
  );

export function RoleInput({
  control,
  errors,
}: {
  control: Control<UserForm>;
  errors: FieldErrors<UserForm>;
}) {
  return (
    <Controller
      name='role'
      control={control}
      rules={{ required: 'Role is required.' }}
      render={({ field }) => (
        <TextField
          select
          variant='outlined'
          fullWidth
          size='small'
          label='Role'
          value={field.value ?? ''}
          onChange={field.onChange}
          error={!!errors.role}
          helperText={errors.role?.message}
        >
          {roleOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
