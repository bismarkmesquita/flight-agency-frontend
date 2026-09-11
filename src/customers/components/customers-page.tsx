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
import style from "./customers-page.module.scss";
import { Customer } from "@/customers/models/customer";
import { useIsMobile } from "@/base/styles/hooks";
import { useCustomersContext } from "../providers/customers-context";
import { CustomersFilter } from "./customers-filter/customers-filter";
import { Add, Edit } from "@mui/icons-material";
import { useEffect, useState } from "react";
import CreateOrEditCustomerDialog from "./create-customer-dialog/create-customer-dialog";
import WelcomeName from "@/base/components/welcome-name/welcome-name";
import { getAccessInfo, isFullUser } from "@/auth/utils/auth";
import { FULL_USER_ONLY_TIP } from "@/auth/enums/access-level";

export default function CustomersPage() {
    const isMobile = useIsMobile();
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [fullUser, setFullUser] = useState<boolean>(false);
    const {
        filteredCustomers,
        searchQuery,
        page,
        numPages,
        setPage
    } = useCustomersContext();

    useEffect(() => {
        setFullUser(isFullUser(getAccessInfo()));
    }, []);

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
                        <CustomerRow key={index} customer={customer} onEdit={openEditDialog} canEdit={fullUser} />
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
                    <Tooltip title={fullUser ? "" : FULL_USER_ONLY_TIP}>
                        <span>
                            {isMobile ? (
                                <IconButton color="primary" onClick={openCreateDialog} disabled={!fullUser}>
                                    <Add />
                                </IconButton>
                            ) : (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Add />}
                                    onClick={openCreateDialog}
                                    disabled={!fullUser}
                                >
                                    Add Customer
                                </Button>
                            )}
                        </span>
                    </Tooltip>
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

function CustomerRow({ customer, onEdit, canEdit }: {
    customer: Customer,
    onEdit: (c: Customer) => void,
    canEdit: boolean,
}) {
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
                <Tooltip title={canEdit ? "" : FULL_USER_ONLY_TIP}>
                    <span>
                        <IconButton
                            color="primary"
                            onClick={() => onEdit(customer)}
                            disabled={!canEdit}
                        >
                            <Edit />
                        </IconButton>
                    </span>
                </Tooltip>
            </TableCell>
        </TableRow>
    );
}
