export const checkParams = asyncHandler(async (req, res, next) => {
    // this middleware check for valid params like id
    if (!req.params || Object.keys(req.params).length === 0) {
        throw new APIerror(400, "No parameters provided");
    }

    // checking all param values to be not a undeined or null or empty
    for (const [key, value] of Object.entries(req.params)) {
        if (
            value === undefined ||
            value === null ||
            value === "" ||
            value === "undefined" ||
            value === "null"
        ) {
            throw new APIerror(400, `Invalid value for param: ${key}`);
        }
    }

    next();
});