import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "../Footer";

describe("Footer", () => {
  test("renders brand and navigation links", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: /greenrent/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse properties/i })).toHaveAttribute("href", "/properties");
  });
});
