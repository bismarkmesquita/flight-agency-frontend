import { useSearchReservationsContext } from '@/reservations/providers/search-reservations-context';
import style from './reservation-filter.module.scss';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';

export function ReservationFilter() {
  const {
    searchQuery,
    setSearchQuery,
    months,
    selectedMonth,
    setSelectedMonth
  } = useSearchReservationsContext();

  return (
    <div className={style.root}>
      <div className={style.search}>
        <TextField
          variant='outlined'
          fullWidth
          size='small'
          label='Locator, Flight or Customer'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={style.searchField}
        />
      </div>
      <div className={style.dropdown}>
        <FormControl size='small' fullWidth>
          <InputLabel id='class-label'>Month</InputLabel>
          <Select
            labelId='month-label'
            label='Month'
            value={selectedMonth || 'all'}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedMonth(value === 'all' ? null : value);
            }}
          >
            <MenuItem value='all'>All</MenuItem>
            {months.map((month, index) => (
              <MenuItem value={month} key={index}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </div>
  );
}
