import { Airline } from '@/flights/models/airline';
import { Airport } from '@/flights/models/airport';
import { FlightForm } from '@/flights/models/forms';
import { Autocomplete, TextField } from '@mui/material';
import { Control, Controller, FieldErrors } from 'react-hook-form';

const FLIGHT_NUMBER_MAX_LENGTH: number = 4;

export function FlightNumberInput({
  control,
  errors,
  disabled = false,
}: {
  control: Control<FlightForm>;
  errors: FieldErrors<FlightForm>;
  disabled?: boolean;
}) {
  return (
    <Controller
      name='flight_number'
      control={control}
      rules={{
        required: 'Flight Number is required.',
        maxLength: {
          value: FLIGHT_NUMBER_MAX_LENGTH,
          message: `Maximum of${FLIGHT_NUMBER_MAX_LENGTH} characters`,
        },
      }}
      render={({ field }) => (
        <TextField
          variant='outlined'
          fullWidth
          disabled={disabled}
          size='small'
          label='Flight Number'
          value={field.value ?? ''}
          onChange={field.onChange}
          error={!!errors.flight_number}
          helperText={
            errors.flight_number?.message ??
            `${field.value?.length ?? 0}/${FLIGHT_NUMBER_MAX_LENGTH} characters`
          }
          slotProps={{ htmlInput: { maxLength: FLIGHT_NUMBER_MAX_LENGTH } }}
        >
        </TextField>
      )}
    />
  );
}

export function AirlineInput({
  control,
  errors,
  airlines,
  disabled = false,
}: {
  control: Control<FlightForm>;
  errors: FieldErrors<FlightForm>;
  airlines: Airline[];
  disabled?: boolean;
}) {
  return (
    <Controller
      name='airline_id'
      control={control}
      rules={{ required: 'Airline is required.' }}
      render={({ field }) => {

        const selectedAirline = airlines.find(a => a.id === field.value) || null;

        return (
          <Autocomplete
            fullWidth
            disabled={disabled}
            size="small"
            options={airlines}
            getOptionLabel={(option) => option.name}
            value={selectedAirline}
            onChange={(event, newValue) => {
              field.onChange(newValue ? newValue.id : null);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Airline"
                variant="outlined"
                error={!!errors.airline_id}
                helperText={
                  errors.airline_id?.message ?? ` `
                }
              />
            )}
          />
        );
      }}
    />
  );
}

export function DepartureAirportInput({
  control,
  errors,
  airports,
  disabled = false,
}: {
  control: Control<FlightForm>;
  errors: FieldErrors<FlightForm>;
  airports: Airport[];
  disabled?: boolean;
}) {
  return (
    <Controller
      name='departure_airport_id'
      control={control}
      rules={{ required: 'Departure Airport is required.' }}
      render={({ field }) => {
        const selectedAirport = airports.find(a => a.id === field.value) || null;

        return (
          <Autocomplete
            fullWidth
            disabled={disabled}
            size="small"
            options={airports}
            getOptionLabel={(option) => `${option.iata} - ${option.name}`}
            value={selectedAirport}
            onChange={(event, newValue) => {
              field.onChange(newValue ? newValue.id : null);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Departure Airport"
                variant="outlined"
                error={!!errors.departure_airport_id}
                helperText={errors.departure_airport_id?.message}
              />
            )}
          />
        );
      }}
    />
  );
}

export function ArrivalAirportInput({
  control,
  errors,
  airports,
  disabled = false,
}: {
  control: Control<FlightForm>;
  errors: FieldErrors<FlightForm>;
  airports: Airport[];
  disabled?: boolean;
}) {
  return (
    <Controller
      name='arrival_airport_id'
      control={control}
      rules={{ required: 'Arrival Airport is required.' }}
      render={({ field }) => {
        const selectedAirport = airports.find(a => a.id === field.value) || null;

        return (
          <Autocomplete
            fullWidth
            disabled={disabled}
            size="small"
            options={airports}
            getOptionLabel={(option) => `${option.iata} - ${option.name}`}
            value={selectedAirport}
            onChange={(event, newValue) => {
              field.onChange(newValue ? newValue.id : null);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Arrival Airport"
                variant="outlined"
                error={!!errors.arrival_airport_id}
                helperText={errors.arrival_airport_id?.message}
              />
            )}
          />
        );
      }}
    />
  );
}
