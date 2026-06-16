"use client";

import {
    Button,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from "@mui/material";
import style from "./suppliers-section.module.scss";
import { useIsMobile } from "@/base/styles/hooks";
import { useManagementContext } from "@/management/providers/management-context";
import { useState } from "react";
import { Supplier } from "@/management/models/supplier";
import { Add, ContentPasteSearch } from "@mui/icons-material";
import CreateOrEditSupplierDialog from "./create-or-edit-supplier-dialog/create-or-edit-supplier-dialog";
import ContentSupplierDialog from "./content-supplier-dialog/content-supplier-dialog";

export default function SuppliersSection() {
    const isMobile = useIsMobile();
    const { suppliers } = useManagementContext();
    const [openUpdateDialog, setOpenUpdateDialog] = useState<boolean>(false);
    const [openContentDialog, setOpenContentDialog] = useState<boolean>(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    const viewContentDialog = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setOpenContentDialog(true);
    };

    const openEditDialog = (supplier: Supplier) => {
        setOpenContentDialog(false);
        setSelectedSupplier(supplier);
        setOpenUpdateDialog(true);
    };

    const openCreateDialog = () => {
        setOpenContentDialog(false);
        setSelectedSupplier(null);
        setOpenUpdateDialog(true);
    };

    const table = (
        <div className={style.table}>
            <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
                <TableHead>
                    <TableRow>
                        <TableCell align='center' className={style.tableCell}>NAME</TableCell>
                        <TableCell align='center' className={style.tableCell}>PHONE</TableCell>
                        <TableCell align='center' className={style.tableCell}></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {suppliers.length > 0 ? (suppliers.map((supplier, index) => (
                        <SupplierRow
                            key={index}
                            supplier={supplier}
                            onViewContent={viewContentDialog}
                        />
                    ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={12} align='center' className={style.size}>
                                No suppliers found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );

    return (
        <div className={style.main}>
            {selectedSupplier && <ContentSupplierDialog
                open={openContentDialog}
                supplier={selectedSupplier}
                onClose={() => setOpenContentDialog(false)}
                onUpdate={() => openEditDialog(selectedSupplier)}
            />}
            <CreateOrEditSupplierDialog
                open={openUpdateDialog}
                onClose={() => setOpenUpdateDialog(false)}
                supplier={selectedSupplier}
            />
            <div className={style.header}>
                <h2>Suppliers</h2>
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
                            Add Supplier
                        </Button>
                    )}
                </div>
            </div>
            {table}
        </div>
    )
}

function SupplierRow({ supplier, onViewContent }: {
    supplier: Supplier,
    onViewContent: (s: Supplier) => void
}) {
    return (
        <TableRow>
            <TableCell align='center' className={style.size}>
                {supplier.name}
            </TableCell>
            <TableCell align='center' className={style.size}>
                {supplier.phone}
            </TableCell>
            <TableCell align='center' className={style.size}>
                <IconButton
                    color="primary"
                    onClick={() => onViewContent(supplier)}
                >
                    <ContentPasteSearch />
                </IconButton>
            </TableCell>
        </TableRow>
    );
}
