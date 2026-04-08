import { render, screen, fireEvent } from "@testing-library/react";
import BookingOptionCard from "../BookingOptionCard";

describe("BookingOptionCard", () => {
  test("renders option details and reserve action", () => {
    const onReserve = jest.fn();

    render(
      <BookingOptionCard
        option={{ id: "1", cancellation: "Free cancellation", prepayment: "No prepayment", propertyStayType: "both", pricePerNight: "Rs 1,000", pricePerMonth: "Rs 25,000", priceForNights: "Rs 3,000" }}
        selectedOption={{ id: "2" }}
        onReserve={onReserve}
        propertyStayType="short"
        longRentFromDates={50000}
        shortStayWithGuestTotal={3000}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /i'll reserve/i }));
    expect(onReserve).toHaveBeenCalled();
    expect(screen.getByText(/free cancellation/i)).toBeInTheDocument();
  });
});
