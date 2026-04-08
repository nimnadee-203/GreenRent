import { act, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

import FeaturedApartmentStrip from "../FeaturedApartmentStrip";

const mockGet = jest.requireMock("axios").default.get;

describe("FeaturedApartmentStrip", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockGet.mockReset();
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1400,
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test("rotates through apartment sets automatically", async () => {
    mockGet.mockResolvedValue({
      data: [
        { _id: "1", title: "Apartment One", price: 150000, location: { city: "Colombo" }, images: [] },
        { _id: "2", title: "Apartment Two", price: 175000, location: { city: "Kandy" }, images: [] },
        { _id: "3", title: "Apartment Three", price: 190000, location: { city: "Galle" }, images: [] },
        { _id: "4", title: "Apartment Four", price: 210000, location: { city: "Negombo" }, images: [] },
      ],
    });

    render(
      <MemoryRouter>
        <FeaturedApartmentStrip />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/apartment one/i)).toBeInTheDocument());
    expect(screen.getByText(/apartment two/i)).toBeInTheDocument();
    expect(screen.getByText(/apartment three/i)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(4500);
    });

    await waitFor(() => expect(screen.getByText(/apartment four/i)).toBeInTheDocument());
  });
});