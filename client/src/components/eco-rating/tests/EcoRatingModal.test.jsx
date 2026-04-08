import { render, screen, fireEvent } from "@testing-library/react";
import EcoRatingModal from "../EcoRatingModal";

describe("EcoRatingModal", () => {
  const ecoForm = {
    energyRating: "A",
    transportDistance: "< 1 km",
    solarPanels: true,
    ledLighting: false,
    efficientAc: false,
    waterSavingTaps: false,
    rainwaterHarvesting: false,
    waterMeter: false,
    recyclingAvailable: false,
    compostAvailable: false,
    evCharging: false,
    goodVentilationSunlight: true,
  };

  test("returns null when closed", () => {
    const { container } = render(
      <EcoRatingModal
        isOpen={false}
        activeProperty={null}
        ecoForm={ecoForm}
        onEcoFieldChange={() => jest.fn()}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
        onClear={jest.fn()}
        isSubmitting={false}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test("renders modal content and actions when open", () => {
    const onClose = jest.fn();
    const onClear = jest.fn();

    render(
      <EcoRatingModal
        isOpen={true}
        activeProperty={{ _id: "p1", title: "Eco Apartment", ecoRatingId: "e1" }}
        ecoForm={ecoForm}
        onEcoFieldChange={() => jest.fn()}
        onClose={onClose}
        onSubmit={jest.fn()}
        onClear={onClear}
        isSubmitting={false}
      />
    );

    expect(screen.getByText(/configure eco-profile/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /clear rating/i }));
    expect(onClear).toHaveBeenCalledWith("p1");
  });
});
