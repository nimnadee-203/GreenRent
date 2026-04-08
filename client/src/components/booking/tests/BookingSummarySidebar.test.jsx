import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BookingSummarySidebar from "../BookingSummarySidebar";

describe("BookingSummarySidebar", () => {
  test("renders price summary and updates guest count", () => {
    const setShortStayGuests = jest.fn();

    render(
      <MemoryRouter>
        <BookingSummarySidebar
          propertyId="p1"
          property={{ title: "Eco Apartment" }}
          checkInDate="2030-01-01"
          checkOutDate="2030-01-04"
          propertyStayType="short"
          monthsFromDates={3}
          nights={3}
          includedShortStayGuests={2}
          shortStayGuests={2}
          setShortStayGuests={setShortStayGuests}
          shortExtraGuests={0}
          shortExtraGuestTotal={0}
          dailyRate={1000}
          monthlyRate={25000}
          longRentFromDates={75000}
          shortStayWithGuestTotal={3000}
          formatDate={(value) => value}
        />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "4" } });
    expect(setShortStayGuests).toHaveBeenCalledWith(4);
    expect(screen.getByText(/your price summary/i)).toBeInTheDocument();
  });
});
