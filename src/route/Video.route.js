import { Router } from "express";
import { verifyJwt } from "../middleware/verifyJwt.js"
import { getallvideos, getVideoById, uploadVideo } from "../controller/video.controller.js";
import { verifyChannel } from "../middleware/verifyChannel.js";

const router = Router();

router
    .route('/')
    .get(getallvideos)
    .post(verifyJwt, verifyChannel, uploadVideo)

router
    .route('/:id')
    .get(getVideoById)
    .put(verifyJwt, verifyChannel)
    .delete(verifyJwt, verifyChannel) 

export default router;