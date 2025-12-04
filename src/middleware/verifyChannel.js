import { User } from "../model/User.model.js";
import { APIerror } from "../util/APIerror.js";
import { asyncHandler } from "../util/asyncHandler.js";

// verifying channel exists for a user
// for channel based routes
export const verifyChannel = asyncHandler(async (req, res, next) => {
    const uploader = await User.findById(req.user._id).populate("channel");

    if (!uploader) {
        throw new APIerror(404, "User not found");
    }

    // checking for channel
    const channel = uploader.channel?.[0];

    if (!channel) {
        throw new APIerror(404, "Channel does not exist to create video");
    }

    req.channel = channel;

    next();
});