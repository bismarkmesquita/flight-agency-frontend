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
import style from "./users-section.module.scss";
import { useIsMobile } from "@/base/styles/hooks";
import { useManagementContext } from "@/management/providers/management-context";
import { useState } from "react";
import { Add, Edit } from "@mui/icons-material";
import { User } from "@/auth/models/user";
import CreateOrEditUserDialog from "./create-or-edit-user-dialog/create-or-edit-user-dialog";
import { USER_ROLE_TO_LABEL } from "@/auth/enums/user-role";

export default function UsersSection() {
    const isMobile = useIsMobile();
    const { users } = useManagementContext();
    const [openUpdateDialog, setOpenUpdateDialog] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const openEditDialog = (user: User) => {
        setSelectedUser(user);
        setOpenUpdateDialog(true);
    };

    const openCreateDialog = () => {
        setSelectedUser(null);
        setOpenUpdateDialog(true);
    };

    const table = (
        <div className={style.table}>
            <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
                <TableHead>
                    <TableRow>
                        <TableCell align='center' className={style.tableCell}>NAME</TableCell>
                        <TableCell align='center' className={style.tableCell}>E-MAIL</TableCell>
                        <TableCell align='center' className={style.tableCell}>ROLE</TableCell>
                        <TableCell align='center' className={style.tableCell}></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.length > 0 ? (users.map((user, index) => (
                        <UserRow
                            key={index}
                            user={user}
                            onEdit={() => openEditDialog(user)}
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
            <CreateOrEditUserDialog
                open={openUpdateDialog}
                onClose={() => setOpenUpdateDialog(false)}
                user={selectedUser}
            />
            <div className={style.header}>
                <h2>Employees</h2>
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
                            Add Employees
                        </Button>
                    )}
                </div>
            </div>
            {table}
        </div>
    )
}

function UserRow({ user, onEdit }: {
    user: User,
    onEdit: (u: User) => void
}) {
    return (
        <TableRow>
            <TableCell align='center' className={style.size}>
                {user.name}
            </TableCell>
            <TableCell align='center' className={style.size}>
                {user.email}
            </TableCell>
            <TableCell align='center' className={style.size}>
                {USER_ROLE_TO_LABEL[user.role]}
            </TableCell>
            <TableCell align='center' className={style.size}>
                <IconButton
                    color="primary"
                    onClick={() => onEdit(user)}
                >
                    <Edit />
                </IconButton>
            </TableCell>
        </TableRow>
    );
}
