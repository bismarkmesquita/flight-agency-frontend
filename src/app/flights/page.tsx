import FlightsPage from "@/flights/components/flights-page";
import { FlightsProvider } from "@/flights/providers/flights-context";

export default function Page() {
    return (
        <FlightsProvider>
            <FlightsPage />
        </FlightsProvider>
    )
}