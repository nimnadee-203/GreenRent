import { jest } from "@jest/globals";

const mockCreateProperty = jest.fn();
const mockListProperties = jest.fn();
const mockGetPropertyById = jest.fn();
const mockUpdateProperty = jest.fn();

const mockValidatePropertyCreate = jest.fn();
const mockValidatePropertyUpdate = jest.fn();
const mockJwtVerify = jest.fn();

jest.unstable_mockModule("../../services/propertyService.js", () => ({
  createProperty: mockCreateProperty,
  listProperties: mockListProperties,
  getPropertyById: mockGetPropertyById,
  updateProperty: mockUpdateProperty,
  deleteProperty: jest.fn(),
}));

jest.unstable_mockModule("../../services/openStreetMapService.js", () => ({
  geocodeAddress: jest.fn(),
}));

jest.unstable_mockModule("../../validators/propertyValidators.js", () => ({
  validatePropertyCreate: mockValidatePropertyCreate,
  validatePropertyUpdate: mockValidatePropertyUpdate,
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    verify: mockJwtVerify,
  },
}));

jest.unstable_mockModule("../../models/Property.js", () => ({
  default: {
    findByIdAndUpdate: jest.fn(),
    findById: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

const {
  createPropertyHandler,
  listPropertiesHandler,
  updatePropertyHandler,
} = await import("../../controllers/propertyController.js");

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("propertyController unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValidatePropertyCreate.mockReturnValue([]);
    mockValidatePropertyUpdate.mockReturnValue([]);
  });

  test("createPropertyHandler returns 401 when auth user id is missing", async () => {
    const req = { body: { title: "House test" }, user: {} };
    const res = createRes();

    await createPropertyHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Authenticated user id not found" });
    expect(mockCreateProperty).not.toHaveBeenCalled();
  });

  test("listPropertiesHandler returns 401 if includeHidden has no token", async () => {
    const req = {
      query: { includeHidden: "true" },
      cookies: {},
      headers: {},
    };
    const res = createRes();

    await listPropertiesHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Authentication required for includeHidden" });
  });

  test("updatePropertyHandler returns 403 when requester is neither owner nor admin", async () => {
    const req = {
      params: { id: "p1" },
      body: { title: "Updated title" },
      user: { id: "u2", role: "seller" },
    };
    const res = createRes();

    mockGetPropertyById.mockResolvedValue({ _id: "p1", ownerId: "u1" });

    await updatePropertyHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "You can only update your own properties" });
    expect(mockUpdateProperty).not.toHaveBeenCalled();
  });
});
