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
import { verifyCreateChannel } from "../middleware/input.channelfields.verify.js";
import { checkForFiles } from "../middleware/checkforfile.middleware.js";

const router = Router();

// "/" route have get(getownchannel) post(cretechannel) put(updatechannel) dlete(deletechannel)
router
    .route('/')
    .get(verifyJwt, verifyChannel, getSelfChannel)
    .post(verifyJwt, upload.fields(
        [
            {
                name: "avatar",
                maxCount: 1
            }
        ]
    ),
        verifyCreateChannel,
        checkForFiles,
        createChannel
    )
    .put(verifyJwt, verifyChannel, updateChannel)
    .delete(verifyJwt, verifyChannel, deleteChannel);

// "/:id" for to getchannel by id, subscribechannel(post), delete(unsubscribe from channel)
router
    .route('/:id')
    .get(getChannelById)
    .post(verifyJwt, subscribeChannel)
    .delete(verifyJwt, unsubscribeChannel)

// get subscription from channel for a user
router.route("/subscription/:id").get(verifyJwt, isSubscribed);

// routes to update avatar and banner
router
    .route('/banner')
    .put(verifyJwt, upload.fields(
        [
            {
                name: "banner",
                maxCount: 1
            }
        ]
    ), checkForFiles,
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
    ), checkForFiles,
        updateAvatar
    )

export default router;