import { render, screen, fireEvent } from "@testing-library/react";
import UpdateDetailsModal from "../UpdateDetailsModal";

describe("UpdateDetailsModal", () => {
  const updateForm = {
    title: "Eco Apartment",
    description: "Bright unit",
    stayType: "both",
    monthlyPrice: "25000",
    dailyPrice: "5000",
    area: "900",
    address: "12 Green St",
    displayAddress: "Palm Grove",
    city: "Colombo",
    state: "Western",
    country: "Sri Lanka",
    bedrooms: "2",
    bathrooms: "1",
    maxGuests: "4",
    parking: true,
    imageFiles: [],
  };

  test("returns null when closed", () => {
    const { container } = render(
      <UpdateDetailsModal
        isOpen={false}
        updateForm={updateForm}
        existingUpdateImages={[]}
        onFieldChange={() => jest.fn()}
        onImageFilesChange={jest.fn()}
        onRemoveSelectedImage={jest.fn()}
        isSubmitting={false}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test("renders update controls and actions when open", () => {
    const onClose = jest.fn();

    render(
      <UpdateDetailsModal
        isOpen={true}
        updateForm={updateForm}
        existingUpdateImages={["/img1.jpg"]}
        onFieldChange={() => jest.fn()}
        onImageFilesChange={jest.fn()}
        onRemoveSelectedImage={jest.fn()}
        isSubmitting={false}
        onClose={onClose}
        onSubmit={jest.fn()}
      />
    );

    expect(screen.getByText(/update property details/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /update property/i })).toBeInTheDocument();
  });
});
