import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PropertyCompareHeader from "../PropertyCompareHeader";

describe("PropertyCompareHeader", () => {
  test("renders header and clear action", () => {
    const onClear = jest.fn();

    render(
      <MemoryRouter>
        <PropertyCompareHeader onClear={onClear} />
      </MemoryRouter>
    );

    expect(screen.getByText(/compare up to 3 listings/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /clear all/i }));
    expect(onClear).toHaveBeenCalled();
    expect(screen.getByRole("link", { name: /back to listings/i })).toHaveAttribute("href", "/properties");
  });
});
