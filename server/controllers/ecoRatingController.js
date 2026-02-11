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

export const createEcoRatingHandler = async (req, res) => {
  try {
    const errors = validateEcoRatingCreate(req.body);
    if (errors.length) {
      return res.status(400).json({ errors });
    }

    // Add authenticated user info
    const ratingData = {
      ...req.body,
      createdBy: req.user.id,
    };

    const ecoRating = await createEcoRating(ratingData);
    return res.status(201).json(ecoRating);
  } catch (error) {
    console.error("Create eco rating error:", error);
    return res.status(500).json({ message: "Failed to create eco rating" });
  }
};

export const listEcoRatingsHandler = async (req, res) => {
  try {
    const filter = {};
    if (req.query.listingId) {
      filter.listingId = req.query.listingId;
    }

    const ecoRatings = await listEcoRatings(filter);
    return res.status(200).json(ecoRatings);
  } catch (error) {
    console.error("List eco ratings error:", error);
    return res.status(500).json({ message: "Failed to fetch eco ratings" });
  }
};

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
