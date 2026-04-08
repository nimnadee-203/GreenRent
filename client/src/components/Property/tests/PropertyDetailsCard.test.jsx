import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const mockGet = jest.requireMock("axios").default.get;

jest.mock("../../Home/Navbar", () => () => <div>Navbar</div>);
jest.mock("../../Home/Footer", () => () => <div>Footer</div>);

import PropertyDetailsCard from "../PropertyDetailsCard";

describe("PropertyDetailsCard", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test("shows loading state before data is returned", () => {
    mockGet.mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter initialEntries={["/properties/p1"]}>
        <PropertyDetailsCard />
      </MemoryRouter>
    );

    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  test("shows error state when data fetch fails", async () => {
    mockGet.mockRejectedValue(new Error("network error"));

    render(
      <MemoryRouter initialEntries={["/properties/p1"]}>
        <PropertyDetailsCard />
      </MemoryRouter>
    );

    expect(await screen.findByText(/failed to load property details/i)).toBeInTheDocument();
  });
});
