import { render, screen } from "@testing-library/react";
import BookingPropertyOverviewCard from "../BookingPropertyOverviewCard";

describe("BookingPropertyOverviewCard", () => {
  test("renders property overview and fallback details", () => {
    render(
      <BookingPropertyOverviewCard
        property={{
          title: "Eco Apartment",
          propertyType: "apartment",
          location: { address: "12 Green St" },
          bedrooms: 2,
          bathrooms: 1,
          area: 900,
          description: "A nice eco-friendly home.",
          images: [],
        }}
      />
    );

    expect(screen.getByText(/eco apartment/i)).toBeInTheDocument();
    expect(screen.getByText(/12 Green St/i)).toBeInTheDocument();
    expect(screen.getByText(/2 Bedrooms/i)).toBeInTheDocument();
    expect(screen.getByText(/^apartment$/i)).toBeInTheDocument();
  });
});
