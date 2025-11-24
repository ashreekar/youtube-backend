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
    unsubscribeChannel,
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
    .delete(verifyJwt,unsubscribeChannel)

router.route("/subscription/:id").get(verifyJwt, isSubscribed);

router
    .route('/banner')
    .put(verifyJwt, upload.fields(
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
    .put(verifyJwt, upload.fields(
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