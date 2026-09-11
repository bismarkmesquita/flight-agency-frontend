import { Supplier } from "@/management/models/supplier";
import { Close } from "@mui/icons-material";
import { Button, Dialog, DialogContent, DialogTitle, Divider, IconButton, Tooltip } from "@mui/material";
import style from "./content-supplier-dialog.module.scss";
import { FULL_USER_ONLY_TIP } from "@/auth/enums/access-level";

type Props = {
    open: boolean,
    supplier: Supplier,
    onClose: () => void;
    onUpdate: () => void;
    canEdit: boolean;
}

export default function ContentSupplierDialog({
    open,
    supplier,
    onClose,
    onUpdate,
    canEdit,
}: Props) {
    return (
        <Dialog open={open} maxWidth='xs' fullWidth>
            <DialogTitle className={style.title}>
                Info
                <IconButton
                    color="primary"
                    onClick={onClose}
                >
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent className={style.content}>
                <div className={style.list}>
                    <p><b>Name:</b> {supplier.name}</p>
                    <p><b>Phone:</b> {supplier.phone}</p>
                    <p><b>Tax ID:</b> {supplier.tax_id ?? ''}</p>
                    <Divider flexItem />
                    <p><b>Country:</b> {supplier.country}</p>
                    <p><b>State:</b> {supplier.state}</p>
                    <p><b>Postal Code:</b> {supplier.postal_code}</p>
                    <p><b>City:</b> {supplier.city}</p>
                    <p><b>Neighborhood:</b> {supplier.neighborhood}</p>
                    <p><b>Address:</b> {supplier.address}</p>
                    <p><b>Address Number:</b> {supplier.address_number}</p>
                    <p><b>Complement:</b> {supplier.complement}</p>
                </div>
                <Tooltip title={canEdit ? "" : FULL_USER_ONLY_TIP}>
                    <span className={style.button}>
                        <Button
                            variant="contained"
                            onClick={onUpdate}
                            disabled={!canEdit}
                        >
                            Edit supplier
                        </Button>
                    </span>
                </Tooltip>
            </DialogContent>
        </Dialog>
    )
}
