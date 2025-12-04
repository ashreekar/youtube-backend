import { Playlist } from "../model/Playlist.model.js";
import { Post } from "../model/Post.model.js";
import { Video } from "../model/Video.model.js";
import { APIerror } from "../util/APIerror.js";
import { asyncHandler } from "../util/asyncHandler.js";

// middleware veirifes the owner of resource
export const verifyOwner = asyncHandler(async (req, res, next) => {
    // finding  resource and calling next middleware
    const video = await Video.findOne(
        {
            $and: [{ _id: req.params.id }, { owner: req.channel._id }]
        }
    )

    if (video) {
        return next();
    }

    const post = await Post.findOne(
        {
            $and: [{ _id: req.params.id }, { postedBy: req.channel._id }]
        }
    )

    if (post) {
        return next();
    }

    const playlist = await Playlist.findOne(
        {
            $and: [{ _id: req.params.id }, { createdBy: req.channel._id }]
        }
    )

    if (playlist) {
        return next();
    }

    throw new APIerror(400, "Invalid acceas to modify resource");
});