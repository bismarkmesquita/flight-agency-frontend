import { TextField } from '@mui/material';
import { useCustomersContext } from '@/customers/providers/customers-context';

export function CustomersFilter() {
    const {
        searchQuery,
        setSearchQuery,
    } = useCustomersContext();

    return (
        <div>
            <div>
                <TextField
                    variant='outlined'
                    fullWidth
                    size='small'
                    label='Name, E-mail or Phone'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
    );
}
