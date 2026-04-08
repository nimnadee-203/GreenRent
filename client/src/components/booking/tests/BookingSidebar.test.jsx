import { render, screen, fireEvent } from "@testing-library/react";
import BookingSidebar from "../BookingSidebar";

describe("BookingSidebar", () => {
  test("renders summary and triggers actions", () => {
    const viewModel = {
      summaryPrefersShortStay: true,
      summaryRate: 1000,
      summaryGuestCount: 2,
      setSummaryGuests: jest.fn(),
      includedGuests: 2,
      summaryExtraGuestFee: 1000,
      summaryExtraGuests: 0,
      summaryAdditionalFee: 0,
      formatCurrency: (value) => `Rs ${value}`,
      handleCheckAvailabilityClick: jest.fn(),
      scrollToSection: jest.fn(),
      mapSectionRef: {},
      reviewsSectionRef: {},
      handleWishlistToggle: jest.fn(),
      wishlistLoading: false,
      isWishlisted: false,
      handleShareListing: jest.fn(),
      shareFeedback: "",
    };

    render(<BookingSidebar viewModel={viewModel} />);

    fireEvent.click(screen.getByRole("button", { name: /check availability/i }));
    fireEvent.click(screen.getByRole("button", { name: /add to wishlist/i }));
    expect(viewModel.handleCheckAvailabilityClick).toHaveBeenCalled();
    expect(viewModel.handleWishlistToggle).toHaveBeenCalled();
  });
});
