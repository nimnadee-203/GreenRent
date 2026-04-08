import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BookingDetailsForm from "../BookingDetailsForm";

describe("BookingDetailsForm", () => {
  test("renders long stay fields and submits", () => {
    const onSubmit = jest.fn((event) => event.preventDefault());
    const setStayType = jest.fn();
    const setMonths = jest.fn();
    const setFullName = jest.fn();
    const setEmail = jest.fn();
    const setPhone = jest.fn();
    const setCheckInDate = jest.fn();
    const setCheckOutDate = jest.fn();
    const setNotes = jest.fn();

    render(
      <MemoryRouter>
        <BookingDetailsForm
          onSubmit={onSubmit}
          stayType="long"
          setStayType={setStayType}
          months={3}
          setMonths={setMonths}
          fullName="Jane Doe"
          setFullName={setFullName}
          email="jane@example.com"
          setEmail={setEmail}
          phone="0712345678"
          setPhone={setPhone}
          checkInDate="2030-01-01"
          setCheckInDate={setCheckInDate}
          checkOutDate="2030-04-01"
          setCheckOutDate={setCheckOutDate}
          notes=""
          setNotes={setNotes}
          dailyPrice={1000}
          monthlyPrice={25000}
          nights={3}
          shortStayTotal={3000}
          longStayTotal={75000}
          formatLkr={(value) => `Rs ${value}`}
          error=""
          successMessage=""
          submitting={false}
          bookingId="booking-1"
        />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/months/i)).toBeInTheDocument();
    expect(screen.getByText(/total for 3 months/i)).toBeInTheDocument();

    fireEvent.submit(screen.getByRole("button", { name: /confirm booking/i }).closest("form"));
    expect(onSubmit).toHaveBeenCalled();
  });
});
