import { render, screen } from "@testing-library/react";
import Card from "../Card";
import { servicesData } from "../../../assets/assets";

describe("Card", () => {
  test("renders service cards from assets", () => {
    render(<Card />);

    expect(screen.getByText(/chefs/i)).toBeInTheDocument();
    expect(screen.getByText(servicesData[0].title)).toBeInTheDocument();
  });
});
