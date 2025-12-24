import { APIerror } from "../utils/APIerror.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const checkForFiles = asyncHandler((req, res, next) => {
    // check for empty files
    if (!req.files || Object.keys(req.files).length === 0) {
        throw new APIerror(400, "We are expecting files in request body");
    }

    next();
})

export { checkForFiles };