import { render, screen, fireEvent } from "@testing-library/react";
import PropertyFilterBar from "../PropertyFilterBar";

describe("PropertyFilterBar", () => {
  test("renders filters and active chips", () => {
    const updateFilter = jest.fn(() => jest.fn());
    const removeFilterChip = jest.fn();
    const resetFilters = jest.fn();

    render(
      <PropertyFilterBar
        filters={{ search: "Colombo", propertyType: "apartment", minPrice: 1000, maxPrice: 5000 }}
        updateFilter={updateFilter}
        typeOptions={["apartment", "house"]}
        activeFilters={["Colombo", "apartment"]}
        removeFilterChip={removeFilterChip}
        resetFilters={resetFilters}
      />
    );

    expect(screen.getByPlaceholderText(/search locations or keywords/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /clear all/i }));
    expect(resetFilters).toHaveBeenCalled();
  });
});
