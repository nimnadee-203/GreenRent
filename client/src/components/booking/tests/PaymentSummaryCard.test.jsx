import { render, screen } from "@testing-library/react";
import PaymentSummaryCard from "../PaymentSummaryCard";

describe("PaymentSummaryCard", () => {
  test("renders payment summary details", () => {
    render(
      <PaymentSummaryCard
        property={{ title: "Eco Apartment" }}
        selectedOption={{ type: "Standard" }}
        stayType="short"
        bookingData={{ numberOfGuests: 2, checkInDate: "2030-01-01", checkOutDate: "2030-01-04", totalPrice: 3000 }}
        dailyRate={1000}
        monthlyRate={25000}
        nights={3}
        monthsForLong={3}
      />
    );

    expect(screen.getByText(/payment summary/i)).toBeInTheDocument();
    expect(screen.getByText(/eco apartment/i)).toBeInTheDocument();
    expect(screen.getByText(/total due/i)).toBeInTheDocument();
  });
});
