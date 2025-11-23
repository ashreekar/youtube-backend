import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js"
import { verifyJwt } from "../middleware/verifyJwt.js";
import { verifyChannel } from "../middleware/verifyChannel.js";

import {
    createChannel,
    deleteChannel,
    getChannelById,
    getSelfChannel,
    isSubscribed,
    subscribeChannel,
    updateAvatar,
    updateBanner,
    updateChannel
} from "../controller/channel.controller.js";

const router = Router();

router
    .route('/')
    .get(verifyJwt, getSelfChannel)
    .post(verifyJwt, upload.fields(
        [
            {
                name: "avatar",
                maxCount: 1
            }
        ]
    ),
        createChannel
    )
    .put(verifyJwt, verifyChannel, updateChannel)
    .delete(verifyJwt, verifyChannel, deleteChannel);

router
    .route('/:id')
    .get(verifyJwt, getChannelById)
    .post(verifyJwt, subscribeChannel)

router.route("/subscription/:id").get(verifyJwt, isSubscribed);

router
    .route('/banner')
    .post(verifyJwt, upload.fields(
        [
            {
                name: "banner",
                maxCount: 1
            }
        ]
    ),
        updateBanner
    )

router
    .route('/avatar')
    .post(verifyJwt, upload.fields(
        [
            {
                name: "avatar",
                maxCount: 1
            }
        ]
    ),
        updateAvatar
    )

export default router;