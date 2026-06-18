"use client";

import {
    Button,
    IconButton,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from "@mui/material";
import style from "./customers-page.module.scss";
import { Customer } from "@/customers/models/customer";
import { useIsMobile } from "@/base/styles/hooks";
import { useCustomersContext } from "../providers/customers-context";
import { CustomersFilter } from "./customers-filter/customers-filter";
import { Add, Edit } from "@mui/icons-material";
import { useState } from "react";
import CreateOrEditCustomerDialog from "./create-customer-dialog/create-customer-dialog";
import WelcomeName from "@/base/components/welcome-name/welcome-name";

export default function CustomersPage() {
    const isMobile = useIsMobile();
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const {
        filteredCustomers,
        searchQuery,
        page,
        numPages,
        setPage
    } = useCustomersContext();

    const openEditDialog = (customer: Customer) => {
        setSelectedCustomer(customer);
        setOpenDialog(true);
    };

    const openCreateDialog = () => {
        setSelectedCustomer(null);
        setOpenDialog(true);
    };

    const table = (
        <div className={style.table}>
            <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
                <TableHead>
                    <TableRow>
                        <TableCell align='center' className={style.tableCell}>NAME</TableCell>
                        <TableCell align='center' className={style.tableCell}>E-MAIL</TableCell>
                        <TableCell align='center' className={style.tableCell}>PHONE</TableCell>
                        <TableCell align='center' className={style.tableCell}></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredCustomers.length > 0 ? (filteredCustomers.map((customer, index) => (
                        <CustomerRow key={index} customer={customer} onEdit={openEditDialog} />
                    ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={12} align='center' className={style.size}>
                                No customers found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );

    return (
        <div className={style.main}>
            <CreateOrEditCustomerDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                customer={selectedCustomer}
            />
            <WelcomeName />
            <div className={style.menu}>
                <div className={style.search}>
                    <CustomersFilter />
                </div>
                <div className={style.buttons}>
                    {isMobile ? (
                        <IconButton color="primary" onClick={openCreateDialog}>
                            <Add />
                        </IconButton>
                    ) : (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Add />}
                            onClick={openCreateDialog}
                        >
                            Add Customer
                        </Button>
                    )}
                </div>
            </div>
            {table}
            {!searchQuery && (
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

function CustomerRow({ customer, onEdit }: { customer: Customer, onEdit: (c: Customer) => void }) {
    return (
        <TableRow>
            <TableCell align='center' className={style.size}>
                {customer.name}
            </TableCell>
            <TableCell align='center' className={style.size}>
                {customer.email}
            </TableCell>
            <TableCell align='center' className={style.size}>
                {customer.phone}
            </TableCell>
            <TableCell align='center' className={style.size}>
                <IconButton
                    color="primary"
                    onClick={() => onEdit(customer)}
                >
                    <Edit />
                </IconButton>
            </TableCell>
        </TableRow>
    );
}
