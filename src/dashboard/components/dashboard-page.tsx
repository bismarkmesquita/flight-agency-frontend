"use client";

import style from "./dashboard-page.module.scss";
import WelcomeName from "@/base/components/welcome-name/welcome-name";
import KPICard from "./cards/kpi-card";
import ChartCard from "./cards/chart-card";
import TableCard from "./cards/table-card";
import { DashboardPeriod } from "../services/dashboard";
import { LoadingWrapper } from "@/base/components/loading-wrapper/loading-wrapper";
import { formatMoney } from "@/base/utils/format-inputs";
import { useDashboardContext } from "../providers/dashboard-context";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import classNames from "classnames";
import { getAccessInfo } from "@/auth/utils/auth";
import { UserRole } from "@/auth/enums/user-role";
import { useEffect, useState } from "react";

export default function Dashboard() {
    const {
        data,
        loading,
        period,
        setPeriod,
        sortedSellers,
        sortedCustomers,
        sellersOrdering,
        setSellersOrdering,
        customersOrdering,
        setCustomersOrdering
    } = useDashboardContext();

    const [role, setRole] = useState<UserRole | undefined>(undefined);

    useEffect(() => {
        const user = getAccessInfo();
        if (user?.role) {
            setRole(user.role);
        }
    }, []);

    const canAccessRankingSellers =
        role !== undefined && [UserRole.ADMIN, UserRole.MANAGER].includes(role);

    return (
        <div className={style.main}>
            <div className={style.header}>
                <WelcomeName />
                <Select
                    value={period}
                    fullWidth
                    size="small"
                    className={style.dropdown}
                    onChange={(e: SelectChangeEvent) =>
                        setPeriod(e.target.value as DashboardPeriod)
                    }
                >
                    <MenuItem value="7d">7 days</MenuItem>
                    <MenuItem value="30d">30 days</MenuItem>
                    <MenuItem value="month">This month</MenuItem>
                    <MenuItem value="year">This year</MenuItem>
                </Select>
            </div>
            <LoadingWrapper loading={loading} className={style.loading}>
                {data && <>
                    <div className={style.kpis}>
                        <KPICard
                            title={"Reservations"}
                            value={data?.kpis.total_reservations}
                        />
                        <KPICard
                            title={"Total sale"}
                            value={`$ ${formatMoney(data?.kpis.total_sold)}`}
                        />
                        <KPICard
                            title={"Average Ticket"}
                            value={`$ ${formatMoney(data?.kpis.avg_ticket)}`}
                        />
                        {data?.kpis.total_profit != null && <KPICard
                            title={"Profit"}
                            value={`$ ${formatMoney(data.kpis.total_profit)}`}
                        />}
                    </div>

                    <div
                        className={
                            classNames(style.charts, { [style.year]: period === "year" })
                        }
                    >
                        <ChartCard
                            title="Sales"
                            data={data.charts.sales}
                            period={period}
                        />
                        {data.charts.profit && <ChartCard
                            title="Profit"
                            data={data.charts.profit}
                            period={period}
                        />}
                    </div>

                    <div className={style.tables}>
                        {canAccessRankingSellers && <div className={style.table}>
                            <TableCard
                                title={"Seller Ranking"}
                                columns={[
                                    { key: "name", label: "Name" },
                                    { key: "total", label: "Total" },
                                    { key: "reservations", label: "Reservations" },
                                ]}
                                rows={sortedSellers}
                                ordering={sellersOrdering}
                                setOrdering={setSellersOrdering}
                            />
                        </div>}
                        <div className={style.table}>
                            <TableCard
                                title={"Customer Ranking"}
                                columns={[
                                    { key: "name", label: "Name" },
                                    { key: "total", label: "Total" },
                                    { key: "reservations", label: "Reservations" },
                                ]}
                                rows={sortedCustomers}
                                ordering={customersOrdering}
                                setOrdering={setCustomersOrdering}
                            />
                        </div>
                    </div>
                </>
                }
            </LoadingWrapper>
        </div>
    )
}
