import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

import HomeRecommendations from "../HomeRecommendations";

const mockGet = jest.requireMock("axios").default.get;

describe("HomeRecommendations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows empty state when no recommendations are returned", async () => {
    mockGet.mockResolvedValue({ data: { recommendations: [] } });

    render(
      <MemoryRouter>
        <HomeRecommendations />
      </MemoryRouter>
    );

    expect(await screen.findByText(/no matches yet/i)).toBeInTheDocument();
  });
});
