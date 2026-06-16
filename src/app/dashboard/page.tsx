import BasePage from "@/base/components/base-page/base-page";
import DashboardPage from "@/dashboard/dashboard-page";

export default function Page() {
    return (
        <BasePage title="Dashboard">
            <DashboardPage />
        </BasePage>
    );
}
