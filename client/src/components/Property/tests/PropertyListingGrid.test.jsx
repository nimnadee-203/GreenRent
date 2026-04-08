import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PropertyListingGrid from "../PropertyListingGrid";

describe("PropertyListingGrid", () => {
  const baseProps = {
    isLoading: false,
    error: "",
    filteredProperties: [{ _id: "p1" }],
    pagedProperties: [{ _id: "p1", title: "Eco Apartment", location: { city: "Colombo" }, price: 25000, images: [] }],
    totalPages: 1,
    currentPage: 1,
    onRetry: jest.fn(),
    onResetFilters: jest.fn(),
    onPageChange: jest.fn(),
    ecoBadgeClass: () => "bg-emerald-50 text-emerald-700",
    onToggleCompareSelection: jest.fn(),
    onAddToWishlist: jest.fn(),
    compareIds: [],
    wishlistingIds: [],
    toLocationLabel: () => "Colombo",
    toEcoScore: () => 82,
    toAirQuality: () => 7,
    getPrimaryPriceInfo: () => ({ value: 25000, unit: "/month" }),
  };

  test("renders property cards", () => {
    render(
      <MemoryRouter>
        <PropertyListingGrid {...baseProps} />
      </MemoryRouter>
    );

    expect(screen.getByText(/eco apartment/i)).toBeInTheDocument();
  });

  test("shows empty state and reset action", () => {
    render(<PropertyListingGrid {...baseProps} filteredProperties={[]} pagedProperties={[]} />);

    expect(screen.getByText(/no apartments matched your filters/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /reset filters/i }));
    expect(baseProps.onResetFilters).toHaveBeenCalled();
  });
});
