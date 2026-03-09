export const validatePreferences = (payload) => {
    const errors = [];
    const { budgetMin, budgetMax, ecoPriority, propertyType } = payload;

    if (budgetMin !== undefined && (typeof budgetMin !== "number" || budgetMin < 0)) {
        errors.push("budgetMin must be a non-negative number");
    }

    if (budgetMax !== undefined && (typeof budgetMax !== "number" || budgetMax < 0)) {
        errors.push("budgetMax must be a non-negative number");
    }

    if (budgetMin !== undefined && budgetMax !== undefined && budgetMin > budgetMax) {
        errors.push("budgetMin cannot be greater than budgetMax");
    }

    const validEcoPriorities = ["low", "medium", "high"];
    if (ecoPriority !== undefined && !validEcoPriorities.includes(ecoPriority)) {
        errors.push(`ecoPriority must be one of: ${validEcoPriorities.join(", ")}`);
    }

    if (propertyType !== undefined && typeof propertyType !== "string") {
        errors.push("propertyType must be a string");
    }

    return errors;
};
