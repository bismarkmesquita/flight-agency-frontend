import BasePage from "@/base/components/base-page/base-page";
import CustomersPage from "@/customers/components/customers-page";
import { CustomersProvider } from "@/customers/providers/customers-context";

export default function Page() {
    return (
        <CustomersProvider>
            <BasePage title="Customers">
                <CustomersPage />
            </BasePage>
        </CustomersProvider>
    );
}
