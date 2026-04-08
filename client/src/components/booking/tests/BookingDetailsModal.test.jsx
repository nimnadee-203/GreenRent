import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

var mockPost = jest.fn();
var mockPut = jest.fn();
var mockStartBookingTimer = jest.fn();
var mockClearBookingTimer = jest.fn();
var mockGetRemainingBookingMs = jest.fn();

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    post: mockPost,
    put: mockPut,
  },
}));

jest.mock("../../../pages/booking/bookingTimer", () => ({
  startBookingTimer: mockStartBookingTimer,
  clearBookingTimer: mockClearBookingTimer,
  getRemainingBookingMs: mockGetRemainingBookingMs,
}));

import BookingDetailsModal from "../BookingDetailsModal";

describe("BookingDetailsModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRemainingBookingMs.mockReturnValue(0);
  });

  test("shows login prompt when user is not authenticated", () => {
    const navigate = jest.fn();

    render(
      <MemoryRouter>
        <BookingDetailsModal
          property={{ _id: "p1", title: "Eco Apartment", location: { address: "12 Green St" }, maxGuests: 3, price: 1000 }}
          propertyId="p1"
          selectedOption={{ type: "Standard", guests: 2 }}
          checkInDate="2030-01-01"
          checkOutDate="2030-01-03"
          backendUser={null}
          currentUser={null}
          isAuthenticated={false}
          onClose={jest.fn()}
          navigate={navigate}
          defaultStayType="short"
          defaultMonths={1}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/please login or sign up to continue this booking/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login to continue/i })).toBeDisabled();
  });

  test("renders the booking form when authenticated", () => {
    render(
      <MemoryRouter>
        <BookingDetailsModal
          property={{ _id: "p1", title: "Eco Apartment", location: { address: "12 Green St" }, maxGuests: 3, price: 1000 }}
          propertyId="p1"
          selectedOption={{ type: "Standard", guests: 2 }}
          checkInDate="2030-01-01"
          checkOutDate="2030-01-04"
          backendUser={null}
          currentUser={null}
          isAuthenticated={true}
          onClose={jest.fn()}
          navigate={jest.fn()}
          defaultStayType="short"
          defaultMonths={1}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: /confirm booking/i })).toBeInTheDocument();
    expect(screen.getByText(/selected option/i)).toBeInTheDocument();
    expect(screen.getByText(/^short stay$/i)).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: /stay type/i })).not.toBeInTheDocument();
  });

  test("shows static long stay details in the confirm modal", () => {
    render(
      <MemoryRouter>
        <BookingDetailsModal
          property={{ _id: "p1", title: "Eco Apartment", location: { address: "12 Green St" }, maxGuests: 3, price: 1000 }}
          propertyId="p1"
          selectedOption={{ type: "Standard", guests: 2 }}
          checkInDate="2030-01-01"
          checkOutDate="2030-06-01"
          backendUser={null}
          currentUser={null}
          isAuthenticated={true}
          onClose={jest.fn()}
          navigate={jest.fn()}
          defaultStayType="long"
          defaultMonths={5}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/^stay type$/i)).toBeInTheDocument();
    expect(screen.getByText(/^long stay$/i)).toBeInTheDocument();
    expect(screen.getByText(/^months$/i)).toBeInTheDocument();
    expect(screen.getByText(/^5 months$/i)).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: /stay type/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("spinbutton", { name: /months/i })).not.toBeInTheDocument();
  });
});