import { render, screen, fireEvent } from "@testing-library/react";
import BookingSidebar from "../BookingSidebar";

describe("BookingSidebar", () => {
  test("renders summary totals", () => {
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
    };

    render(<BookingSidebar viewModel={viewModel} />);

    expect(screen.getByText(/your price summary/i)).toBeInTheDocument();
    expect(screen.getByText(/includes taxes and charges/i)).toBeInTheDocument();
  });
});
