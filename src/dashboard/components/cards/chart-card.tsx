"use client";

import { DashboardPeriod } from "@/dashboard/services/dashboard";
import style from "../dashboard-page.module.scss";
import {
  ChartsContainer,
  ChartsAxisHighlight,
  ChartsTooltip,
  ChartsXAxis,
  ChartsYAxis,
  LinePlot,
  MarkPlot
} from "@mui/x-charts";

interface ChartPoint {
  label: string;
  value: number;
}

type Props = {
  title: string;
  data: ChartPoint[];
  period: DashboardPeriod;
}

export default function ChartCard({ title, data, period }: Props) {
  const labels = data.map(p => new Date(p.label));
  const values = data.map(p => p.value);

  return (
    <div className={style.card}>
      <p className={style.title}>{title}</p>
      <ChartsContainer
        xAxis={[
          {
            data: labels,
            scaleType: "time",
            tickInterval: getTickInterval(period, labels),
            valueFormatter: (value) => {
              const date = new Date(value);

              if (period === "year") {
                return date.toLocaleString("pt-BR", { month: "short" });
              }

              return date.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
              });
            },
          },
        ]}
        series={[{ type: "line", data: values }]}
        height={data.length > 50 ? 300 : 250}
        margin={{ bottom: 10 }}
        skipAnimation
      >
        <ChartsAxisHighlight x="line" />
        <ChartsTooltip />
        <LinePlot />
        {data.length <= 20 && <MarkPlot />}
        <ChartsXAxis
          tickInterval={getTickInterval(period, labels)}
          tickLabelStyle={{ fontSize: 12 }}

        />
        <ChartsYAxis />
      </ChartsContainer>
    </div>
  );
}

function getTickInterval(period: DashboardPeriod, dates: Date[]) {
  if (period === "year") {
    return (index: number) => dates[index].getDate() === 1;
  }

  const step = Math.ceil(dates.length / 6);
  return (index: number) => index % step === 0;
}
