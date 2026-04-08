import { render, screen } from "@testing-library/react";
import BookingDetailsHeaderCard from "../BookingDetailsHeaderCard";

describe("BookingDetailsHeaderCard", () => {
  test("renders property details and selected option summary", () => {
    render(
      <BookingDetailsHeaderCard
        property={{ title: "Eco Apartment", location: { address: "12 Green St" }, bedrooms: 2, bathrooms: 1 }}
        selectedOption={{ type: "Standard", guests: 2 }}
        stayType="short"
        dailyPrice={1000}
        monthlyPrice={25000}
        nights={3}
        shortStayTotal={3000}
        months={1}
        longStayTotal={25000}
        formatLkr={(value) => `Rs ${value}`}
      />
    );

    expect(screen.getByText(/eco apartment/i)).toBeInTheDocument();
    expect(screen.getByText(/12 Green St/i)).toBeInTheDocument();
    expect(screen.getByText(/selected option/i)).toBeInTheDocument();
    expect(screen.getByText(/total for 3 nights/i)).toBeInTheDocument();
  });
});
