import style from "./profile.module.scss";

interface Props {
    avatar: string;
    name: string;
}

export default function Profile({ avatar, name }: Props) {
    return (
        <div className={style.profile}>
            <img src={avatar} alt="Avatar" />
            <span className={style.name}>{name}</span>
        </div>
    )
}