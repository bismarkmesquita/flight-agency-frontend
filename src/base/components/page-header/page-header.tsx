import style from "./page-header.module.scss";

interface Props {
    title: string;
    description: string;
}

export default function PageHeader({ title, description }: Props) {
    return (
        <div className={style.root}>
            <h1 className={style.title}>{title}</h1>
            <span className={style.description}>{description}</span>
        </div>
    )
}