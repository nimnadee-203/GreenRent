import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MyListingsListingCard from "../MyListingsListingCard";

describe("MyListingsListingCard", () => {
  const property = {
    _id: "p1",
    title: "Eco Apartment",
    images: ["/img1.jpg"],
    price: 25000,
    location: { address: "12 Green St" },
    createdAt: "2024-01-01T00:00:00.000Z",
  };

  test("renders property card and actions", () => {
    const onOpenUpdateModal = jest.fn();
    const onOpenEcoModal = jest.fn();
    const onDeleteListing = jest.fn();

    render(
      <MemoryRouter>
        <MyListingsListingCard
          property={property}
          ecoState={{ status: "active", label: "Active", color: "bg-emerald-50", score: 82 }}
          formatPrice={(value) => `Rs ${value}`}
          onOpenUpdateModal={onOpenUpdateModal}
          onOpenEcoModal={onOpenEcoModal}
          onDeleteListing={onDeleteListing}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/eco apartment/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /update details/i }));
    fireEvent.click(screen.getByRole("button", { name: /edit rating/i }));
    fireEvent.click(screen.getByRole("button", { name: /delete post/i }));

    expect(onOpenUpdateModal).toHaveBeenCalledWith(property);
    expect(onOpenEcoModal).toHaveBeenCalledWith(property);
    expect(onDeleteListing).toHaveBeenCalledWith("p1");
  });
});
