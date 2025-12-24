import { Channel } from "../models/Channel.model.js";
import { APIerror } from "../utils/APIerror.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const handleRegex = /^[a-z][a-z0-9_]{2,15}$/;

// channel create field verification
const verifyCreateChannel = asyncHandler(async (req, res, next) => {
    const { name, handle } = req.body;

    if (!name || !handle) {
        throw new APIerror(400, "name and handle are required");
    }

    // if channel exists then user is not allowed to created channel
    const channelExists = await Channel.findOne({
        $or: [
            { owner: req.user._id },
            { handle }
        ]
    });

    if (channelExists) {
        throw new APIerror(
            400,
            "User already has a channel or this handle is taken"
        );
    }

    // checks for valid handle
    if (!handleRegex.test(handle)) {
        throw new APIerror(400, "Invalid handle");
    }

    next();
});

export { verifyCreateChannel };