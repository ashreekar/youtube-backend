import { APIerror } from "../util/APIerror.js";
import { APIresponse } from "../util/APIresponse.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { Reaction } from "../model/Reaction.model.js"

// all controler to get reaction for video,comment and post are same except search model
// all controler to toggle reaction for video,comment and post are same except search model
// all controler to delete reaction for video,comment and post are same except search model

const getReactionStatusOnVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // if user not found sending no reaction status
    if (!req.user) {
        return res.status(200).json(new APIresponse(200, { reaction: "NA" }, "reaction sent, no user logged in"))
    }

    const reaction = await Reaction.findOne(
        {
            video: id,
            reactionBy: req?.user?._id
        }
    ).select("type")

    // if no reaction found sending reactionas NA
    if (!reaction) {
        return res.status(200).json(new APIresponse(200, { reaction: "NA" }, "reaction sent"))
    }

    const type = reaction.type;

    res.status(200).json(new APIresponse(200, { reaction: type }, "reaction sent "));
})

const getReactionStatusOnComment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // if user not found sending no reaction status
    if (!req.user) {
        return res.status(200).json(new APIresponse(200, { reaction: "NA" }, "reaction sent"))
    }

    const reaction = await Reaction.findOne(
        {
            comment: id,
            reactionBy: req?.user?._id
        }
    )

    // if no reaction found sending reactionas NA
    if (!reaction) {
        return res.status(200).json(new APIresponse(200, { reaction: "NA" }, "reaction sent"))
    }

    const type = reaction.type;

    res.status(200).json(new APIresponse(200, { reaction: type }, "reaction sent"));
})

const getReactionStatusOnPost = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // if user not found sending no reaction status
    if (!req.user) {
        return res.status(200).json(new APIresponse(200, { reaction: "NA" }, "reaction sent"))
    }

    const reaction = await Reaction.findOne(
        {
            post: id,
            reactionBy: req?.user?._id
        }
    )

    // if no reaction found sending reactionas NA
    if (!reaction) {
        return res.status(200).json(new APIresponse(200, { reaction: "NA" }, "reaction sent"))
    }

    const type = reaction.type;

    res.status(200).json(new APIresponse(200, { reaction: type }, "reaction sent"));
})

const toggleReactionOnVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { type } = req.body;

    // expects a type of reaction [like,dislike]
    if (type !== "like" && type !== "dislike") {
        throw new APIerror(400, "Invalid reaction");
    }

    // updating existing reaction if not exists then creating a new reaction
    const updateReaction = await Reaction.findOneAndUpdate(
        {
            reactionBy: req.user._id,
            video: id
        },
        {
            type
        },
        { new: true }
    )

    if (!updateReaction) {
        await Reaction.create(
            {
                reactionBy: req.user._id,
                type,
                video: id,
            }
        )
    }

    res.status(201).json(new APIresponse(201, { reaction: type }, "Reaction registered"));
})

const toggleReactionOnPost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { type } = req.body;

    // expects a type of reaction [like,dislike]
    if (type !== "like" && type !== "dislike") {
        throw new APIerror(400, "Invalid reaction");
    }

    // updating existing reaction if not exists then creating a new reaction
    const updateReaction = await Reaction.findOneAndUpdate(
        {
            reactionBy: req.user._id,
            post: id
        },
        {
            type
        },
        { new: true }
    )

    if (!updateReaction) {
        await Reaction.create(
            {
                reactionBy: req.user._id,
                type,
                post: id
            }
        )
    }

    res.status(201).json(new APIresponse(201, { reaction: type }, "Reaction registered"));
})

const toggleReactionOnComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { type } = req.body;

    // expects a type of reaction [like,dislike]
    if (type !== "like" && type !== "dislike") {
        throw new APIerror(400, "Invalid reaction");
    }

    // updating existing reaction if not exists then creating a new reaction
    const updateReaction = await Reaction.findOneAndUpdate(
        {
            reactionBy: req.user._id,
            comment: id
        },
        {
            type
        },
        { new: true }
    )

    if (!updateReaction) {
        await Reaction.create(
            {
                reactionBy: req.user._id,
                type,
                comment: id
            }
        )
    }

    res.status(201).json(new APIresponse(201, { reaction: type }, "Reaction registered"));
})

const deleteReactionOnVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // delteing a reaction on video
    await Reaction.deleteOne(
        {
            video: id,
            reactionBy: req.user._id
        }
    )

    res.status(200).json(new APIresponse(200, { reaction: "NA" }, "Deleted reaction"))
})

const deleteReactionOnComment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // delteing a reaction on video
    await Reaction.deleteOne(
        {
            comment: id,
            reactionBy: req.user._id
        }
    )

    res.status(200).json(new APIresponse(200, { reaction: "NA" }, "Deleted reaction"))
})

const deleteReactionPost = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // delteing a reaction on video
    await Reaction.deleteOne(
        {
            post: id,
            reactionBy: req.user._id
        }
    )

    res.status(200).json(new APIresponse(200, { reaction: "NA" }, "Deleted reaction"))
})

export {
    getReactionStatusOnComment,
    getReactionStatusOnPost,
    getReactionStatusOnVideo,
    toggleReactionOnVideo,
    toggleReactionOnComment,
    toggleReactionOnPost,
    deleteReactionOnComment,
    deleteReactionPost,
    deleteReactionOnVideo
}