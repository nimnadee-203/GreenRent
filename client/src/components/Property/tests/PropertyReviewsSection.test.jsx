import { render, screen, fireEvent } from "@testing-library/react";
import PropertyReviewsSection from "../PropertyReviewsSection";

describe("PropertyReviewsSection", () => {
  test("shows empty state when there are no reviews", () => {
    const vm = {
      reviewsSectionRef: { current: null },
      displayReviews: [],
      averageScoreOutOfFive: 0,
      reviewsData: { reviews: [], summary: null },
      ratingBuckets: {},
      canReviewApartment: true,
      setShowReviewModal: jest.fn(),
      backendUser: { role: "admin" },
      reviewActionLoadingById: {},
      moderateReview: jest.fn(),
      replyDrafts: {},
      setReplyDrafts: jest.fn(),
      submitReply: jest.fn(),
      replySubmittingByReview: {},
      replyError: "",
    };

    render(<PropertyReviewsSection vm={vm} />);

    expect(screen.getByText(/no reviews yet/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /review apartment/i }));
    expect(vm.setShowReviewModal).toHaveBeenCalledWith(true);
  });
});
