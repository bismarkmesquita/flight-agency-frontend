"use client";

import { useState } from "react"
import { Flight } from "../models/flight"
import { Button, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { useIsMobile } from "@/base/styles/hooks";
import { format, parseISO } from "date-fns";
import { FlightTakeoff, PersonSearch } from '@mui/icons-material';
import Image from "next/image";
import style from "./flights-page.module.scss";
import ReservationDialog from "./reservation-dialog/reservation-dialog";
import { useFlightsContext } from "../providers/flights-context";
import { useRouter } from "next/navigation";

export default function FlightsPage() {
    const isMobile = useIsMobile();
    const { flights } = useFlightsContext();
    const [flightSelected, setFlightSelected] = useState<Flight>();
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const router = useRouter();

    const handleReserve = (flight: Flight) => {
        setFlightSelected(flight);
        setOpenDialog(true);
    };

    const table = (
        <div className={style.table}>
            <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
                <TableHead className={style.tableHead}>
                    <TableRow>
                        <TableCell align='center' className={style.tableCell}>DEPARTURE</TableCell>
                        <TableCell align='center' className={style.tableCell}>DESTINY</TableCell>
                        <TableCell align='center' className={style.tableCell}>FLIGHT</TableCell>
                        <TableCell align='center' className={style.tableCell}>AIRLINE</TableCell>
                        <TableCell align='center' className={style.tableCell}>TIME</TableCell>
                        <TableCell align='center' className={style.tableCell}>RESERVATIONS</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {flights.length > 0 ? (
                        flights.map((flight, index) => (
                            <FlightRow key={index} flight={flight} onReserve={handleReserve} />
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={9} align='center' className={style.size}>
                                No flights found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );

    return (
        <div>
            {openDialog && flightSelected && <ReservationDialog
                open={openDialog}
                flight={flightSelected}
                onClose={() => setOpenDialog(false)}
            />}
            <div className={style.header}>
                <div className={style.logo} onClick={() => router.push("/dashboard")}>
                    <FlightTakeoff className={style.icon} />
                    <h1>Flight Agency</h1>
                </div>
                <div className={style.schedule}>
                    {format(new Date(), "dd/MM/yyyy")}
                </div>
            </div>
            {table}
        </div>
    )
}

function FlightRow({ flight, onReserve }: { flight: Flight, onReserve: (flight: Flight) => void }) {
    const time = format(parseISO(flight.departure_date), "dd/MM/yyyy hh:mm");
    const imageSrc = `https://assets.duffel.com/img/airlines/for-light-background/full-color-lockup/${flight.airline.iata}.svg`

    return (
        <TableRow>
            <TableCell align='center' className={style.size}>
                {flight.departure_airport.iata}
            </TableCell>
            <TableCell align='center' className={style.size}>
                {flight.arrival_airport.iata}
            </TableCell>
            <TableCell align='center' className={style.size}>
                {flight.iata}
            </TableCell>
            <TableCell align='center' className={style.size}>
                <Image
                    width={150}
                    height={30}
                    src={imageSrc}
                    alt={`Airline logo ${flight.airline.iata}`}
                ></Image>
            </TableCell>
            <TableCell align='center' className={style.size}>
                {time}
            </TableCell>
            <TableCell align='center' className={style.size}>
                <Button
                    onClick={() => onReserve(flight)}
                    endIcon={<PersonSearch />}
                    className={style.size}
                >
                    {flight.reservations.length}
                </Button>
            </TableCell>
        </TableRow>
    );
}