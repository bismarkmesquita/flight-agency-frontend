import {
    MenuItem,
    Select,
    SelectChangeEvent,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from "@mui/material";
import style from "../dashboard-page.module.scss";
import { formatMoney } from "@/base/utils/format-inputs";
import { OrderingRanking } from "@/dashboard/providers/dashboard-context";

interface Column<T> {
    key: keyof T;
    label: string;
}

interface TableCardProps<T> {
    title: string;
    columns: Column<T>[];
    rows: T[];
    ordering: OrderingRanking;
    setOrdering: (value: OrderingRanking) => void;
}

export default function TableCard<T>({
    title,
    columns,
    rows,
    ordering,
    setOrdering
}: TableCardProps<T>) {
    return (
        <div className={style.card}>
            <div className={style.header}>
                <p className={style.title}>{title}</p>
                <Select
                    value={ordering}
                    fullWidth
                    size="small"
                    className={style.dropdown}
                    defaultValue={OrderingRanking.TOTAL}
                    onChange={(e: SelectChangeEvent) =>
                        setOrdering(e.target.value as OrderingRanking)
                    }
                >
                    <MenuItem value={OrderingRanking.TOTAL}>Total</MenuItem>
                    <MenuItem value={OrderingRanking.RESERVATIONS}>Reservas</MenuItem>
                </Select>
            </div>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell align="left">{columns[0].label}</TableCell>
                        <TableCell align="center">{columns[2].label}</TableCell>
                        <TableCell align="center">{columns[1].label}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, index) => (
                        <TableRow key={index}>
                            <TableCell align="left">{String(row[columns[0].key])}</TableCell>
                            <TableCell align="center">{String(row[columns[2].key])}</TableCell>
                            <TableCell align="center">{`R$ ${formatMoney(String(row[columns[1].key]))}`}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
