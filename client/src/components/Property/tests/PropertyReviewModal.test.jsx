import { render, screen, fireEvent, waitFor } from "@testing-library/react";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

import PropertyReviewModal from "../PropertyReviewModal";

describe("PropertyReviewModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows step one by default and advances to step two", () => {
    render(<PropertyReviewModal propertyId="p1" ecoRatingId="e1" onClose={jest.fn()} onSuccess={jest.fn()} />);

    expect(screen.getByText(/review apartment/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /next step/i }));
    expect(screen.getByText(/verify landlord claims/i)).toBeInTheDocument();
  });

  test("shows validation error when eco rating id is missing", async () => {
    render(<PropertyReviewModal propertyId="p1" ecoRatingId={null} onClose={jest.fn()} onSuccess={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /next step/i }));
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    await waitFor(() => expect(screen.getByText(/cannot review property without an existing landlord eco-rating/i)).toBeInTheDocument());
  });
});
