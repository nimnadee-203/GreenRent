import { render, screen, fireEvent } from "@testing-library/react";
import PropertyDetailsHeader from "../PropertyDetailsHeader";

describe("PropertyDetailsHeader", () => {
  test("renders hero and action controls", () => {
    const vm = {
      property: { title: "Eco Apartment", propertyType: "apartment", location: { address: "12 Green St" }, price: 25000 },
      images: ["/img1.jpg"],
      primaryImage: "/img1.jpg",
      currentImageIndex: 0,
      autoplayEnabled: false,
      setAutoplayEnabled: jest.fn(),
      setIsLightboxOpen: jest.fn(),
      handlePrevImage: jest.fn(),
      handleNextImage: jest.fn(),
      propertyStayType: "long",
      toLocationLabel: () => "12 Green St",
      handleCheckAvailabilityClick: jest.fn(),
      scrollToSection: jest.fn(),
      mapSectionRef: {},
      reviewsSectionRef: {},
      handleWishlistToggle: jest.fn(),
      wishlistLoading: false,
      isWishlisted: false,
      handleShareListing: jest.fn(),
      shareFeedback: "",
      summaryPrefersShortStay: false,
      hasMonthlyPrice: true,
      hasDailyPrice: false,
      formatCurrency: (value) => `Rs ${value}`,
      summaryRate: 25000,
      summaryGuestCount: 2,
      setSummaryGuests: jest.fn(),
      includedGuests: 2,
      summaryExtraGuestFee: 1000,
      summaryExtraGuests: 0,
      summaryAdditionalFee: 0,
      today: "2030-01-01",
      checkInDate: "2030-01-02",
      checkOutDate: "2030-01-05",
      setCheckInDate: jest.fn(),
      setCheckOutDate: jest.fn(),
      isAtLeastThreeMonths: jest.fn(() => false),
    };

    render(<PropertyDetailsHeader vm={vm} />);

    expect(screen.getByText(/eco apartment/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /check availability/i }));
    expect(vm.handleCheckAvailabilityClick).toHaveBeenCalled();
  });
});
