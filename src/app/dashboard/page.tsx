import BasePage from "@/base/components/base-page/base-page";
import DashboardPage from "@/dashboard/components/dashboard-page";
import { DashboardProvider } from "@/dashboard/providers/dashboard-context";

export default function Page() {
    return (
        <BasePage title="Dashboard">
            <DashboardProvider>
                <DashboardPage />
            </DashboardProvider>
        </BasePage>
    );
}
