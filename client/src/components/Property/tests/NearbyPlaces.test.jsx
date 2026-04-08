import { render, screen } from "@testing-library/react";
import NearbyPlaces from "../NearbyPlaces";

describe("NearbyPlaces", () => {
  test("renders empty nearby categories", () => {
    render(<NearbyPlaces nearbyPlaces={null} nearbyLoading={false} />);

    expect(screen.getByText(/near you/i)).toBeInTheDocument();
    expect(screen.getAllByText(/no nearby data yet/i)).toHaveLength(4);
  });
});
