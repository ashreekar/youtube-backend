import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js"
import { verifyJwt } from "../middleware/verifyJwt.js";
import { createChannel, getChannelById, getSelfChannel, subscribeChannel, updateAvatar, updateBanner } from "../controller/channel.contorller.js";

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
    .delete(verifyJwt);

router
    .route('/:id')
    .get(verifyJwt, getChannelById)
    .post(verifyJwt, subscribeChannel)
    .put(verifyJwt);

router
    .post('/banner')
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
    .post('/avatar')
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