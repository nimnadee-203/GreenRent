import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Banner from "../Banner";

describe("Banner", () => {
  test("renders hero content and link", () => {
    render(
      <MemoryRouter>
        <Banner />
      </MemoryRouter>
    );

    expect(screen.getByText(/discover unique experiences/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explore properties/i })).toHaveAttribute("href", "/properties");
  });
});
