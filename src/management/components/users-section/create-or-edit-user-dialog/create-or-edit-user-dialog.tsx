"use client";

import { useForm } from "react-hook-form";
import style from "./create-or-edit-user-dialog.module.scss";
import { Button, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useSnackbar } from "@/base/context/SnackbarContext";
import { LoadingWrapper } from "@/base/components/loading-wrapper/loading-wrapper";
import { useManagementContext } from "@/management/providers/management-context";
import { UserForm } from "@/management/models/forms";
import {
    EmailInput,
    NameInput,
    RoleInput,
} from "./user-inputs";
import { User } from "@/auth/models/user";
import { UserRole } from "@/auth/enums/user-role";

type Props = {
    open: boolean;
    onClose: () => void;
    user: User | null;
}

export default function CreateOrEditUserDialog({ open, onClose, user }: Props) {
    const [loading, setLoading] = useState(false);
    const snackbar = useSnackbar();
    const { createUser, updateUser } = useManagementContext();

    const {
        control: userControl,
        handleSubmit,
        formState: { errors: userErrors },
        reset: resetForm,
    } = useForm<UserForm>({
        defaultValues: {},
    });

    useEffect(() => {
        if (user) {
            resetForm({
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            resetForm({
                name: '',
                email: '',
                role: UserRole.SELLER,
            });
        }
    }, [user, open, resetForm]);

    const handleUpdateUser = async (data: UserForm) => {
        setLoading(true);

        const action = user
            ? updateUser(data, user.id)
            : createUser(data)

        const response = await action;
        setLoading(false);

        if (response.success) {
            snackbar.showSnackbar(
                user ? 'User updated!' : 'User created!',
                'success'
            );
            onClose();
        } else {
            snackbar.showSnackbar(`${response.message}`, 'error');
        }
    }

    return (
        <Dialog open={open} maxWidth='xs' fullWidth>
            <LoadingWrapper className={style.loading} loading={loading}>
                <DialogTitle className={style.title}>
                    {user ? "Update user" : "Register user"}
                    <IconButton
                        color="primary"
                        onClick={onClose}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent className={style.inputs}>
                    <NameInput
                        control={userControl}
                        errors={userErrors}
                    />
                    <EmailInput
                        control={userControl}
                        errors={userErrors}
                    />
                    <RoleInput
                        control={userControl}
                        errors={userErrors}
                    />
                    <div className={style.actions}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit(handleUpdateUser)}
                        >
                            {user ? "Update user" : "Register user"}
                        </Button>
                    </div>
                </DialogContent>
            </LoadingWrapper>
        </Dialog>
    )
}
