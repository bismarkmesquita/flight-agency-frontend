import BasePage from "@/base/components/base-page/base-page";
import ManagementPage from "@/management/components/management-page";
import { ManagementProvider } from "@/management/providers/management-context";

export default function Page() {
    return (
        <ManagementProvider>
            <BasePage title="Internal Management">
                <ManagementPage />
            </BasePage>
        </ManagementProvider>
    );
}
