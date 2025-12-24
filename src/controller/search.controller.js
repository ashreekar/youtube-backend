import { asyncHandler } from "../utils/asyncHandler.js";
import { APIerror } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";

import { Video } from "../models/Video.model.js";

// search videos based on title or description
const searchVideos = asyncHandler(async (req, res) => {
    const query = req.query;

    if (!query || query.search_query === "") {
        throw new APIerror(404, "Invalid query from client");
    }

    // doing text search $text field
    const videos = await Video.find(
        {
            $text: { $search: query.search_query }
        },
        {
            score: {
                $meta: "textScore"
            }
        }
    )
        .sort({ score: { $meta: "textScore" } })
        .select("-updatedAt -__v")
        .populate("category")
        .populate("owner", "name handle avatar _id");
    // sorting by relevence by textScore

    if (!(videos.length === 0)) {
        return res.status(200).json(new APIresponse(200, videos, "Videos that included in search query"));
    }

    // if no videos matched in case
    // searching by creating a regexexprssion
    const regex = new RegExp(query.search_query, "i");
    const secondResponse = await Video.find(
        {
            $or: [{ title: regex }, { description: regex }]
        }
    )
        .select("-updatedAt -__v")
        .populate("category")
        .populate("owner", "name handle avatar _id");

    res.status(200).json(new APIresponse(200, secondResponse, "Videos that included in search query"));
})

export { searchVideos };