export const validateRegistration = (payload) => {
    const errors = [];
    const { name, email, password } = payload;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
        errors.push("Name is required and must be a string");
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
        errors.push("Valid email is required");
    }

    if (!password || typeof password !== "string" || password.length < 6) {
        errors.push("Password is required and must be at least 6 characters long");
    }

    return errors;
};

export const validateLogin = (payload) => {
    const errors = [];
    const { email, password } = payload;

    if (!email || typeof email !== "string") {
        errors.push("Email is required");
    }

    if (!password || typeof password !== "string") {
        errors.push("Password is required");
    }

    return errors;
};

export const validateSellerRequest = (payload) => {
    const errors = [];
    const { businessName, contactNumber, reason } = payload;

    if (!businessName || typeof businessName !== "string") {
        errors.push("Business name is required");
    }

    if (!contactNumber || typeof contactNumber !== "string") {
        errors.push("Contact number is required");
    }

    if (!reason || typeof reason !== "string") {
        errors.push("Reason is required");
    }

    return errors;
};
