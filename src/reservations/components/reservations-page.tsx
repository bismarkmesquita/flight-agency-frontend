"use client";

import {
    Button,
    IconButton,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip
} from "@mui/material";
import style from "./reservations-page.module.scss";
import { useIsMobile } from "@/base/styles/hooks";
import { useEffect, useState } from "react";
import { Reservation } from "@/reservations/models/reservation";
import { ReservationFilter } from "./reservation-filter/reservation-filter";
import { Add } from "@mui/icons-material";
import { useSearchReservationsContext } from "../providers/search-reservations-context";
import CreateReservationStepperDialog from "./create-reservation-dialog/create-reservation-stepper-dialog";
import { format } from "date-fns";
import WelcomeName from "@/base/components/welcome-name/welcome-name";
import { getAccessInfo, isFullUser } from "@/auth/utils/auth";
import { FULL_USER_ONLY_TIP } from "@/auth/enums/access-level";

export default function ReservationsPage() {
    const isMobile = useIsMobile();

    const {
        searchQuery,
        selectedMonth,
        filteredReservations,
        page,
        numPages,
        setPage,
        refreshQuery
    } = useSearchReservationsContext();

    const [openDialogReservation, setOpenDialogReservation] = useState<boolean>(false);
    const [fullUser, setFullUser] = useState<boolean>(false);

    useEffect(() => {
        setFullUser(isFullUser(getAccessInfo()));
    }, []);

    const table = (
        <div className={style.table}>
            <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
                <TableHead>
                    <TableRow>
                        <TableCell align='center' className={style.tableCell}>LOCATOR</TableCell>
                        <TableCell align='center' className={style.tableCell}>CUSTOMER</TableCell>
                        <TableCell align='center' className={style.tableCell}>FLIGHTS</TableCell>
                        <TableCell align='center' className={style.tableCell}>PASSENGERS</TableCell>
                        <TableCell align='center' className={style.tableCell}>SUPPLIER</TableCell>
                        <TableCell align='center' className={style.tableCell}>SELLER</TableCell>
                        <TableCell align='center' className={style.tableCell}>ISSUER</TableCell>
                        <TableCell align='center' className={style.tableCell}>INDICATION</TableCell>
                        <TableCell align='center' className={style.tableCell}>AMOUNT_RECEIVED</TableCell>
                        <TableCell align='center' className={style.tableCell}>COST</TableCell>
                        <TableCell align='center' className={style.tableCell}>PROFIT</TableCell>
                        <TableCell align='center' className={style.tableCell}>DATE</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredReservations.length > 0 ? (filteredReservations.map((reservation, index) => (
                        <ReservationRow key={index} reservation={reservation} />
                    ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={12} align='center' className={style.size}>
                                No reservations found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );

    return (
        <div className={style.main}>
            <CreateReservationStepperDialog
                open={openDialogReservation}
                onClose={() => setOpenDialogReservation(false)}
                onSuccess={() => {
                    refreshQuery();
                    setOpenDialogReservation(false);
                }}
            />
            <WelcomeName />
            <div className={style.menu}>
                <div className={style.search}>
                    <ReservationFilter />
                </div>
                <div className={style.buttons}>
                    <Tooltip title={fullUser ? "" : FULL_USER_ONLY_TIP}>
                        <span>
                            {isMobile ? (
                                <IconButton
                                    color="primary"
                                    onClick={() => setOpenDialogReservation(true)}
                                    disabled={!fullUser}
                                >
                                    <Add />
                                </IconButton>
                            ) : (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Add />}
                                    onClick={() => setOpenDialogReservation(true)}
                                    disabled={!fullUser}
                                >
                                    Add Reservation
                                </Button>
                            )}
                        </span>
                    </Tooltip>
                </div>
            </div>
            {table}
            {!searchQuery && !selectedMonth && (
                <Pagination
                    className={style.pagination}
                    count={numPages}
                    page={page}
                    onChange={(_, page) => setPage(page)}
                    color="primary"
                />
            )}
        </div>
    )
}

function ReservationRow({ reservation }: { reservation: Reservation }) {
    return (
        <TableRow>
            <TableCell align='center' className={style.size}>
                {reservation.locator}
            </TableCell>
            <TableCell align='center' className={style.size}>
                {reservation.sale.customer.name}
            </TableCell>
            <TableCell align='center' className={style.size}>
                {reservation.flights
                    .map((flight) => flight.iata?.toString() || "")
                    .join(" ")}
            </TableCell>
            <TableCell align='center' className={style.size}>
                {reservation.passenger_count}
            </TableCell>
            <TableCell align='center' className={style.size}>
                {reservation.supplier.name}
            </TableCell>
            <TableCell align='center' className={style.size}>
                {reservation.sale.seller.name}
            </TableCell>
            <TableCell align='center' className={style.size}>
                {reservation.issuer.name}
            </TableCell>
            <TableCell align='center' className={style.size}>
                {reservation.sale.indication}
            </TableCell>
            <TableCell align='center' className={style.size}>
                {reservation.sale.amount_received}
            </TableCell>
            <TableCell align='center' className={style.size}>
                {reservation.sale.cost}
            </TableCell>
            <TableCell align='center' className={style.size}>
                {reservation.sale.profit}
            </TableCell>
            <TableCell align='center' className={style.size}>
                {format(reservation.sale.sale_date, "dd/MM/yyyy")}
            </TableCell>
        </TableRow>
    );
}