import { render, screen } from "@testing-library/react";
import MapDisplay from "../MapDisplay";

describe("MapDisplay", () => {
  test("shows empty state when no properties are provided", () => {
    render(<MapDisplay properties={[]} isLoading={false} error="" />);

    expect(screen.getByText(/no properties available/i)).toBeInTheDocument();
  });

  test("shows error state", () => {
    render(<MapDisplay properties={[]} isLoading={false} error="Something went wrong" />);

    expect(screen.getByText(/could not load properties/i)).toBeInTheDocument();
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});
