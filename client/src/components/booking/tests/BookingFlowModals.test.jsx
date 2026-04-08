import { render, screen, fireEvent } from "@testing-library/react";
import BookingFlowModals from "../BookingFlowModals";

describe("BookingFlowModals", () => {
  const baseViewModel = {
    showStayTypeModal: true,
    setShowStayTypeModal: jest.fn(),
    showDatePickerModal: false,
    closeDatePickerModal: jest.fn(),
    stayType: "short",
    monthNames: ["Jan", "Feb", "Mar"],
    today: "2030-01-01",
    checkInDate: "2030-01-02",
    setCheckInDate: jest.fn(),
    checkOutDate: "2030-01-04",
    setCheckOutDate: jest.fn(),
    isAtLeastThreeMonths: jest.fn(() => false),
    fromMonth: "",
    setFromMonth: jest.fn(),
    fromYear: "",
    setFromYear: jest.fn(),
    toMonth: "",
    setToMonth: jest.fn(),
    toYear: "",
    setToYear: jest.fn(),
    currentYear: 2030,
    currentMonthIndex: 0,
    yearOptions: [2030, 2031],
    handleContinueToAvailability: jest.fn(),
    isLongStayStartFromCurrentOrFuture: jest.fn(() => true),
    isLongStayRangeChronological: jest.fn(() => true),
    getLongStayMonthCount: jest.fn(() => 3),
    availableStayTypes: ["short", "long"],
    handleSelectStayType: jest.fn(),
    showAvailabilityModal: false,
    availabilityLoading: false,
    availabilityResult: null,
    availabilityError: "",
    handleBookNow: jest.fn(),
    setShowAvailabilityModal: jest.fn(),
    showAuthChoiceModal: false,
    setShowAuthChoiceModal: jest.fn(),
    handleChooseAuthAction: jest.fn(),
  };

  test("renders stay type modal choices", () => {
    render(<BookingFlowModals viewModel={baseViewModel} />);

    expect(screen.getByText(/select your stay type/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /short stay/i }));
    expect(baseViewModel.handleSelectStayType).toHaveBeenCalledWith("short");
  });

  test("renders availability modal content", () => {
    render(
      <BookingFlowModals
        viewModel={{
          ...baseViewModel,
          showStayTypeModal: false,
          showDatePickerModal: false,
          showAvailabilityModal: true,
          availabilityResult: { available: true, stayType: "short", checkInDate: "2030-01-02", checkOutDate: "2030-01-04" },
        }}
      />
    );

    expect(screen.getByText(/availability check/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /book now/i })).toBeInTheDocument();
  });
});
