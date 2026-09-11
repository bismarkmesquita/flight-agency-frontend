import { APIResponse, usePrivateAPI } from "@/base/services/api";
import { GetDashboardResponse } from "@/dashboard/models/dashboard";
import { AxiosInstance } from "axios";
import { useMemo } from "react";

class DashboardService {
    constructor(private privateAPI: AxiosInstance) { }

    async fetchDashboard(filters?: DashboardFilters) {
        const response = await this.privateAPI.get<APIResponse<GetDashboardResponse>>(
            '/agency/dashboard/',
            { params: filters }
        );
        return response.data;
    }
}

export type DashboardPeriod = "7d" | "30d" | "month" | "year";

export interface DashboardFilters {
    period?: DashboardPeriod;
    start?: string;
    end?: string;
    month?: number;
    year?: number;
}

export function useDashboardService() {
    const privateAPI = usePrivateAPI();
    const service = useMemo(() => new DashboardService(privateAPI), [privateAPI]);
    return service;
}
