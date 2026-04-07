import EcoRating from "../models/EcoRating.js";
import { getAirQualityScore } from "./airQualityService.js";

const ENERGY_RATING_POINTS = {
  A: 30,
  B: 25,
  C: 15,
  D: 5,
  E: 0,
};

const TRANSPORT_POINTS = {
  "< 1 km": 10,
  "1-3 km": 5,
  "> 3 km": 0,
};

const capAt100 = (value) => Math.min(100, Math.max(0, value));

export const calculateTotalScore = (criteria) => {
  let score = 0;

  score += ENERGY_RATING_POINTS[criteria.energyRating] ?? 0;
  score += criteria.solarPanels ? 20 : 0;
  score += criteria.ledLighting ? 10 : 0;
  score += criteria.efficientAc ? 10 : 0;

  score += criteria.waterSavingTaps ? 5 : 0;
  score += criteria.rainwaterHarvesting ? 10 : 0;
  score += criteria.waterMeter ? 5 : 0;

  score += criteria.recyclingAvailable ? 10 : 0;
  score += criteria.compostAvailable ? 5 : 0;

  score += TRANSPORT_POINTS[criteria.transportDistance] ?? 0;

  score += criteria.evCharging ? 5 : 0;
  score += criteria.goodVentilationSunlight ? 5 : 0;

  return capAt100(score);
};

const fetchAirQualityIfAvailable = async (location) => {
  if (!location || location.latitude === undefined || location.longitude === undefined) {
    return { airQualityScore: null, airQualityData: null };
  }

  const aqResult = await getAirQualityScore(location.latitude, location.longitude);
  return { airQualityScore: aqResult.score, airQualityData: aqResult.data };
};

export const createEcoRating = async (data) => {
  const { airQualityScore, airQualityData } = await fetchAirQualityIfAvailable(
    data.location
  );

  const totalScore = calculateTotalScore(data.criteria);

  const ecoRating = await EcoRating.create({
    ...data,
    totalScore,
    airQualityScore,
    externalSignals: {
      ...data.externalSignals,
      airQuality: airQualityData,
    },
  });

  const { default: Property } = await import("../models/Property.js");
  await Property.findByIdAndUpdate(data.listingId, { 
    ecoRatingId: ecoRating._id,
    ecoRatingClearedAt: null 
  });

  return ecoRating;
};

export const listEcoRatings = async (filter = {}) => {
  return EcoRating.find(filter).sort({ createdAt: -1 });
};

export const getEcoRatingById = async (id) => {
  return EcoRating.findById(id);
};

export const updateEcoRating = async (id, data) => {
  const ecoRating = await EcoRating.findById(id);
  if (!ecoRating) {
    return null;
  }

  const currentCriteria = ecoRating.criteria
    ? ecoRating.criteria.toObject()
    : {};
  const nextCriteria = data.criteria
    ? { ...currentCriteria, ...data.criteria }
    : currentCriteria;

  const { airQualityScore, airQualityData } = data.location
    ? await fetchAirQualityIfAvailable(data.location)
    : {
        airQualityScore: ecoRating.airQualityScore ?? null,
        airQualityData: ecoRating.externalSignals?.airQuality || null,
      };

  const totalScore = calculateTotalScore(nextCriteria);

  ecoRating.set({
    ...data,
    criteria: nextCriteria,
    totalScore,
    airQualityScore,
    externalSignals: {
      ...ecoRating.externalSignals,
      ...data.externalSignals,
      airQuality: airQualityData,
    },
  });

  await ecoRating.save();
  return ecoRating;
};

export const deleteEcoRating = async (id) => {
  return EcoRating.findByIdAndDelete(id);
};
