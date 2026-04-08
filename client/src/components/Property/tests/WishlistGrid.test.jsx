import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import WishlistGrid from "../WishlistGrid";

describe("WishlistGrid", () => {
  test("renders empty state and loading state", () => {
    const { rerender } = render(<WishlistGrid isLoading={true} />);
    expect(screen.getByText(/loading wishlist/i)).toBeInTheDocument();

    rerender(<WishlistGrid wishlist={[]} isLoading={false} />);
    expect(screen.getByText(/your wishlist is empty/i)).toBeInTheDocument();
  });

  test("renders wishlist item and remove action", () => {
    const onRemove = jest.fn();

    render(
      <MemoryRouter>
        <WishlistGrid
          wishlist={[{ _id: "p1", title: "Eco Apartment", price: 25000, images: [], location: { address: "12 Green St" }, bedrooms: 2, bathrooms: 1, area: 900 }]}
          removingIds={[]}
          onRemove={onRemove}
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /remove/i }));
    expect(onRemove).toHaveBeenCalledWith("p1");
  });
});
