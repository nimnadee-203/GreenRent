import { render, screen, fireEvent } from "@testing-library/react";
import AddApartmentStageTwoForm from "../AddApartmentStageTwoForm";

describe("AddApartmentStageTwoForm", () => {
  const ecoForm = {
    latitude: "6.9",
    longitude: "79.8",
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

  test("renders eco configuration controls", () => {
    render(
      <AddApartmentStageTwoForm
        ecoForm={ecoForm}
        onEcoFieldChange={() => jest.fn()}
        error=""
        isSubmitting={false}
        onSubmit={jest.fn()}
        onSkip={jest.fn()}
      />
    );

    expect(screen.getByText(/green amenities/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /publish listing/i })).toBeInTheDocument();
  });

  test("supports skip action", () => {
    const onSkip = jest.fn();

    render(
      <AddApartmentStageTwoForm
        ecoForm={ecoForm}
        onEcoFieldChange={() => jest.fn()}
        error=""
        isSubmitting={false}
        onSubmit={jest.fn()}
        onSkip={onSkip}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /^skip$/i }));
    expect(onSkip).toHaveBeenCalled();
  });
});
