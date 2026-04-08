import { render, screen } from "@testing-library/react";
import SearchBar from "../Searchbar";

describe("SearchBar", () => {
  test("renders search inputs and button", () => {
    render(<SearchBar />);

    expect(screen.getByPlaceholderText(/search destinations/i)).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/add dates/i)).toHaveLength(2);
    expect(screen.getByPlaceholderText(/add guests/i)).toBeInTheDocument();
  });
});
