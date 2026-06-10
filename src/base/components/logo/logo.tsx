import style from "./logo.module.scss";
import SchoolIcon from '@mui/icons-material/School';

export default function Logo() {
    return (
        <div className={style.logo}>
            <SchoolIcon className={style.icon} />
            <p>FlightAgency</p>
        </div>
    )
}