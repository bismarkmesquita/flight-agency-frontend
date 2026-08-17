import BasePage from "@/base/components/base-page/base-page";
import { CustomersProvider } from "@/customers/providers/customers-context";
import { FlightsProvider } from "@/flights/providers/flights-context";
import { ManagementProvider } from "@/management/providers/management-context";
import ReservationsPage from "@/reservations/components/reservations-page";
import { ReservationStepperProvider } from "@/reservations/providers/reservation-stepper-context";
import { SearchReservationsProvider } from "@/reservations/providers/search-reservations-context";

export default function Page() {
    return (
        <BasePage title="Reservations">
            <FlightsProvider>
                <CustomersProvider>
                    <SearchReservationsProvider>
                        <ReservationStepperProvider>
                            <ManagementProvider>
                                <ReservationsPage />
                            </ManagementProvider>
                        </ReservationStepperProvider>
                    </SearchReservationsProvider>
                </CustomersProvider>
            </FlightsProvider>
        </BasePage>
    )
}