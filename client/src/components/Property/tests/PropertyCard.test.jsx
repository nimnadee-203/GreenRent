import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PropertyCard from "../PropertyCard";

describe("PropertyCard", () => {
  const baseProps = {
    property: { _id: "p1", title: "Eco Apartment", images: [], area: 900 },
    location: "Colombo",
    ecoScore: 82,
    airQuality: 7,
    bedrooms: 2,
    bathrooms: 1,
    displayPrice: 25000,
    priceUnit: "/month",
    selectedForCompare: false,
    isWishlisting: false,
    ecoBadgeClass: () => "bg-emerald-50 text-emerald-700",
    onToggleCompareSelection: jest.fn(),
    onAddToWishlist: jest.fn(),
  };

  test("renders property details and action buttons", () => {
    const { container } = render(
      <MemoryRouter>
        <PropertyCard {...baseProps} />
      </MemoryRouter>
    );

    expect(screen.getByText(/eco apartment/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /compare/i })).toBeInTheDocument();
    expect(container.querySelectorAll("button")).toHaveLength(2);
  });

  test("triggers compare and wishlist handlers", () => {
    const { container } = render(
      <MemoryRouter>
        <PropertyCard {...baseProps} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /compare/i }));
    fireEvent.click(container.querySelectorAll("button")[1]);

    expect(baseProps.onToggleCompareSelection).toHaveBeenCalled();
    expect(baseProps.onAddToWishlist).toHaveBeenCalled();
  });
});
