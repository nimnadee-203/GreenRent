import { render, screen, fireEvent } from "@testing-library/react";
import AddApartmentStageOneForm from "../AddApartmentStageOneForm";

describe("AddApartmentStageOneForm", () => {
  const form = {
    title: "",
    address: "",
    displayAddress: "",
    city: "",
    state: "",
    country: "",
    stayType: "both",
    monthlyPrice: "25000",
    dailyPrice: "5000",
    area: "900",
    propertyType: "apartment",
    bedrooms: "2",
    bathrooms: "1",
    maxGuests: "4",
    parking: true,
    description: "",
    imageFiles: [],
    coverImageIndex: 0,
  };

  test("renders form fields and submit button", () => {
    render(
      <AddApartmentStageOneForm
        form={form}
        setForm={jest.fn()}
        onFieldChange={() => jest.fn()}
        onImageFilesChange={jest.fn()}
        removeSelectedImage={jest.fn()}
        error=""
        success=""
        isSubmitting={false}
        onSubmit={jest.fn()}
      />
    );

    expect(screen.getByText(/property title/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue to eco-rating/i })).toBeInTheDocument();
  });

  test("shows image removal controls when files are selected", () => {
    const file = new File(["sample"], "image.png", { type: "image/png" });

    render(
      <AddApartmentStageOneForm
        form={{ ...form, imageFiles: [file] }}
        setForm={jest.fn()}
        onFieldChange={() => jest.fn()}
        onImageFilesChange={jest.fn()}
        removeSelectedImage={jest.fn()}
        error=""
        success=""
        isSubmitting={false}
        onSubmit={jest.fn()}
      />
    );

    expect(screen.getByText(/image.png/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /remove image 1/i })).toBeInTheDocument();
  });
});
