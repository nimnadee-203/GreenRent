import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const mockLogout = jest.fn();

jest.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({
    currentUser: null,
    backendUser: null,
    logout: mockLogout,
  }),
}));

import Navbar from "../Navbar";

describe("Navbar", () => {
  test("renders primary navigation links", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /apartments/i })).toBeInTheDocument();
  });
});
