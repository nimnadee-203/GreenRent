import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PaymentSuccessView from "../PaymentSuccessView";

describe("PaymentSuccessView", () => {
  test("renders payment confirmation and navigation links", () => {
    render(
      <MemoryRouter>
        <PaymentSuccessView
          property={{ title: "Eco Apartment" }}
          bookingData={{ _id: "b-1", totalPrice: 3000 }}
          downloadReceipt={jest.fn()}
          formatLkr={(value) => `Rs ${value}`}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/booking confirmed/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /return to home/i })).toBeInTheDocument();
  });
});
