import style from "../dashboard-page.module.scss";

type Props = {
    title: string;
    value?: string | number;
}

export default function KPICard({ title, value }: Props) {
    return (
        <div className={style.card}>
            <p className={style.title}>{title}</p>
            <p className={style.value}>{value}</p>
        </div >
    );
}
