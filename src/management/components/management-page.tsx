import SuppliersSection from "./suppliers-section/suppliers-section";
import UsersSection from "./users-section/users-section";
import style from "./management-page.module.scss";
import WelcomeName from "@/base/components/welcome-name/welcome-name";

export default function ManagementPage() {
    return (
        <div className={style.main}>
            <div className={style.menu}>
                <WelcomeName />
            </div>
            <div className={style.sections}>
                <UsersSection />
                <SuppliersSection />
            </div>
        </div>
    )
}
