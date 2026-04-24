import {
  createEcoRating,
  listEcoRatings,
  getEcoRatingById,
  updateEcoRating,
  deleteEcoRating,
} from "../services/ecoRatingService.js";
import {
  validateEcoRatingCreate,
  validateEcoRatingUpdate,
} from "../validators/ecoRatingValidators.js";

// create new eco rating
export const createEcoRatingHandler = async (req, res) => {
  try {
    // validate input
    const errors = validateEcoRatingCreate(req.body);
    if (errors.length) {
      return res.status(400).json({ errors });
    }

    // Add authenticated user info
    const ratingData = {
      ...req.body,
      createdBy: req.user.id,
    };

    const ecoRating = await createEcoRating(ratingData); // call the service files
    return res.status(201).json(ecoRating);
  } catch (error) {
    console.error("Create eco rating error:", error);
    return res.status(500).json({ message: "Failed to create eco rating" });
  }
};

// Gets eco ratings list.
export const listEcoRatingsHandler = async (req, res) => {
  try {
    // filter with listing id
    const filter = {};
    if (req.query.listingId) {
      filter.listingId = req.query.listingId;
    }
    // the list of eco ratings 
    const ecoRatings = await listEcoRatings(filter);
    return res.status(200).json(ecoRatings);
  } catch (error) {
    console.error("List eco ratings error:", error);
    return res.status(500).json({ message: "Failed to fetch eco ratings" });
  }
};

// get eco rating by id
export const getEcoRatingByIdHandler = async (req, res) => {
  try {
    const ecoRating = await getEcoRatingById(req.params.id);
    if (!ecoRating) {
      return res.status(404).json({ message: "Eco rating not found" });
    }
    return res.status(200).json(ecoRating);
  } catch (error) {
    console.error("Get eco rating error:", error);
    return res.status(500).json({ message: "Failed to fetch eco rating" });
  }
};

// update eco rating by id
export const updateEcoRatingHandler = async (req, res) => {
  try {
    const errors = validateEcoRatingUpdate(req.body);
    if (errors.length) {
      return res.status(400).json({ errors });
    }

    const ecoRating = await updateEcoRating(req.params.id, req.body);

    if (!ecoRating) {
      return res.status(404).json({ message: "Eco rating not found" });
    }

    return res.status(200).json(ecoRating);
  } catch (error) {
    console.error("Update eco rating error:", error);
    return res.status(500).json({ message: "Failed to update eco rating" });
  }
};

// delete eco rating by id
export const deleteEcoRatingHandler = async (req, res) => {
  try {
    const ecoRating = await deleteEcoRating(req.params.id);
    if (!ecoRating) {
      return res.status(404).json({ message: "Eco rating not found" });
    }
    return res.status(200).json({ message: "Eco rating deleted" });
  } catch (error) {
    console.error("Delete eco rating error:", error);
    return res.status(500).json({ message: "Failed to delete eco rating" });
  }
};
