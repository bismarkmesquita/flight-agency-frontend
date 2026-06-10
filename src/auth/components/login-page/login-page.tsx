'use client';

import style from "./login-page.module.scss";
import { LoginForm } from "./login-form/login-form";
import { Button } from "@mui/material";
import Logo from "@/base/components/logo/logo";

export default function LoginPage() {
    return (
        <div className={style.root}>
            <div className={style.header}>
                <Logo />
                <Button
                    variant="contained"
                    component="a"
                    href="https://github.com/bismarkmesquita"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Contact
                </Button>
            </div>
            <div className={style.main}>
                <div className={style.container}>
                    <div className={style.form}>
                        <LoginForm />
                    </div>
                </div>
            </div>
        </div>
    )
}