import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PropertyCompareTable from "../PropertyCompareTable";

describe("PropertyCompareTable", () => {
  test("renders compare table and calls remove handler", () => {
    const onRemoveCompareId = jest.fn();

    render(
      <MemoryRouter>
        <PropertyCompareTable
          properties={[
            { _id: "p1", title: "Eco Apartment", bedrooms: 2, bathrooms: 1, price: 25000, location: { city: "Colombo" } },
          ]}
          onRemoveCompareId={onRemoveCompareId}
          toEcoScore={() => 82}
          toLocationLabel={() => "Colombo"}
          getPrimaryPriceInfo={() => ({ value: 25000, unit: "/month" })}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/eco apartment/i)).toBeInTheDocument();
    expect(screen.getByText(/price/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /remove/i }));
    expect(onRemoveCompareId).toHaveBeenCalledWith("p1");
  });
});
