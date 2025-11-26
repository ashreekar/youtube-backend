import { asyncHandler } from "../util/asyncHandler.js";
import { APIerror } from "../util/APIerror.js";
import { APIresponse } from "../util/APIresponse.js";

import { Video } from "../model/Video.model.js";

const searchVideos = asyncHandler(async (req, res) => {
    const query = req.query;

    if (!query || query.search_query === "") {
        throw new APIerror(404, "Invalid query from client");
    }

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
        .select("-updatedAt -__v -description")
        .populate("category")
        .populate("owner", "name handle avatar _id");

    res.status(200).json(new APIresponse(200, videos, "Videos that included in search query"));
})

export { searchVideos };