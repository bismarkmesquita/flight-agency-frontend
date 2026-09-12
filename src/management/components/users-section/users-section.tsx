"use client";

import {
    Button,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip
} from "@mui/material";
import style from "./users-section.module.scss";
import { useIsMobile } from "@/base/styles/hooks";
import { useManagementContext } from "@/management/providers/management-context";
import { useEffect, useState } from "react";
import { Add, Edit } from "@mui/icons-material";
import { User } from "@/auth/models/user";
import CreateOrEditUserDialog from "./create-or-edit-user-dialog/create-or-edit-user-dialog";
import { USER_ROLE_TO_LABEL } from "@/auth/enums/user-role";
import { FULL_USER_ONLY_TIP } from "@/auth/enums/access-level";
import { getAccessInfo, isFullUser } from "@/auth/utils/auth";

export default function UsersSection() {
    const isMobile = useIsMobile();
    const { users } = useManagementContext();
    const [openUpdateDialog, setOpenUpdateDialog] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [fullUser, setFullUser] = useState<boolean>(false);

    useEffect(() => {
        setFullUser(isFullUser(getAccessInfo()));
    }, []);

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
                            canEdit={fullUser}
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
                                    Add Employees
                                </Button>
                            )}
                        </span>
                    </Tooltip>
                </div>
            </div>
            {table}
        </div>
    )
}

function UserRow({ user, onEdit, canEdit }: {
    user: User,
    onEdit: (u: User) => void,
    canEdit: boolean,
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
                <Tooltip title={canEdit ? "" : FULL_USER_ONLY_TIP}>
                    <span>
                        <IconButton
                            color="primary"
                            onClick={() => onEdit(user)}
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
