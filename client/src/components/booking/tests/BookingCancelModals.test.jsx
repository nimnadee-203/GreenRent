import { render, screen, fireEvent } from "@testing-library/react";
import BookingCancelModals from "../BookingCancelModals";

describe("BookingCancelModals", () => {
  test("renders confirm modal and triggers handlers", () => {
    const onCloseConfirm = jest.fn();
    const onConfirmCancel = jest.fn();

    render(
      <BookingCancelModals
        showCancelConfirmModal={true}
        showCancelSuccessModal={false}
        cancellingBooking={false}
        bookingData={{ _id: "b-1" }}
        cancelledBookingId=""
        onCloseConfirm={onCloseConfirm}
        onConfirmCancel={onConfirmCancel}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /keep booking/i }));
    fireEvent.click(screen.getByRole("button", { name: /yes, cancel booking/i }));

    expect(onCloseConfirm).toHaveBeenCalled();
    expect(onConfirmCancel).toHaveBeenCalled();
    expect(screen.getByText(/cancel this booking/i)).toBeInTheDocument();
    expect(screen.getByText("b-1")).toBeInTheDocument();
  });
});
