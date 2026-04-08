import Property from "../../models/Property.js";

const baseProperty = {
  title: "Modern Eco Apartment",
  description: "Spacious apartment with natural ventilation and green features.",
  location: {
    address: "12 Green Street",
    city: "Colombo",
  },
  price: 150000,
  propertyType: "apartment",
  ecoFeatures: {
    solarPanels: true,
    ledLighting: true,
  },
  ownerId: "seller-1",
};

describe("Property model", () => {
  test("applies defaults for visibility, availability and counters", () => {
    const doc = new Property(baseProperty);
    const error = doc.validateSync();

    expect(error).toBeUndefined();
    expect(doc.stayType).toBe("long");
    expect(doc.availabilityStatus).toBe("available");
    expect(doc.visibilityStatus).toBe("auto");
    expect(doc.viewCount).toBe(0);
  });

  test("fails validation when required location.address is missing", () => {
    const doc = new Property({
      ...baseProperty,
      location: { city: "Colombo" },
    });

    const error = doc.validateSync();
    expect(error.errors["location.address"]).toBeDefined();
  });

  test("fails validation for unsupported propertyType", () => {
    const doc = new Property({
      ...baseProperty,
      propertyType: "villa",
    });

    const error = doc.validateSync();
    expect(error.errors.propertyType).toBeDefined();
  });
});
