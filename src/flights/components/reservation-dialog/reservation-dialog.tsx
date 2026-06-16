import style from "./reservation-dialog.module.scss";
import { Flight, FlightReservation } from "@/flights/models/flight";
import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from "@mui/material";
import { useIsMobile } from "@/base/styles/hooks";
import { WhatsApp } from "@mui/icons-material";

export default function ReservationDialog({ open, onClose, flight }: {
    open: boolean,
    onClose: () => void;
    flight: Flight,
}) {
    const isMobile = useIsMobile();
    const openInNewTab = (path: string) => {
        window.open(path, "_blank");
    };

    function ReservationRow({ reservation }: { reservation: FlightReservation }) {
        return (
            <TableRow>
                <TableCell align='center' className={style.size}>
                    {reservation.locator}
                </TableCell>
                <TableCell align='center' className={style.size}>
                    {reservation.name}
                </TableCell>
                <TableCell align='center' className={style.size}>
                    <Button
                        endIcon={<WhatsApp />}
                        onClick={() => openInNewTab(`https://api.whatsapp.com/send?phone=${reservation.phone}`)}
                    >
                        {reservation.phone}
                    </Button>
                </TableCell>
            </TableRow>
        );
    }

    const table = (
        <div className={style.table}>
            <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
                <TableHead className={style.tableHead}>
                    <TableRow>
                        <TableCell align='center' className={style.tableCell}>LOCATOR</TableCell>
                        <TableCell align='center' className={style.tableCell}>NAME</TableCell>
                        <TableCell align='center' className={style.tableCell}>PHONE</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {flight.reservations.length > 0 ? (
                        flight.reservations.map((reservation, index) => (
                            <ReservationRow key={index} reservation={reservation} />
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={9} align='center' className={style.size}>
                                No reservations found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle className={style.title}>
                <p>Flight <b>{flight.iata}</b></p>
                <Button onClick={onClose} className={style.button}>Close</Button>
            </DialogTitle>
            <DialogContent dividers className={style.content}>
                {table}
            </DialogContent>
        </Dialog>
    )
}