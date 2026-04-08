import { render, screen, fireEvent } from "@testing-library/react";
import PropertyCompareBar from "../PropertyCompareBar";

describe("PropertyCompareBar", () => {
  test("returns null when no properties are selected", () => {
    const { container } = render(<PropertyCompareBar compareCount={0} onClear={jest.fn()} onCompareNow={jest.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  test("renders controls when comparison is active", () => {
    const onClear = jest.fn();
    const onCompareNow = jest.fn();

    render(<PropertyCompareBar compareCount={2} onClear={onClear} onCompareNow={onCompareNow} />);

    expect(screen.getByText(/2 \/ 3 selected for comparison/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /clear/i }));
    fireEvent.click(screen.getByRole("button", { name: /compare now/i }));

    expect(onClear).toHaveBeenCalled();
    expect(onCompareNow).toHaveBeenCalled();
  });
});
