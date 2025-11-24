import { Router } from "express";
import { verifyJwt } from "../middleware/verifyJwt.js"
import { deleteReactionOnComment, deleteReactionOnVideo, deleteReactionPost, getReactionStatusOnComment, getReactionStatusOnPost, getReactionStatusOnVideo, toggleReactionOnComment, toggleReactionOnPost, toggleReactionOnVideo } from "../controller/reaction.controller.js";

const router = Router();

router.route('/video/:id')
    .get(verifyJwt, getReactionStatusOnVideo)
    .post(verifyJwt, toggleReactionOnVideo)
    .delete(verifyJwt, deleteReactionOnVideo)

router.route('/post/:id')
    .get(verifyJwt, getReactionStatusOnPost)
    .post(verifyJwt, toggleReactionOnPost)
    .delete(verifyJwt, deleteReactionPost)

router.route('/comment/:id')
    .get(verifyJwt, getReactionStatusOnComment)
    .post(verifyJwt, toggleReactionOnComment)
    .delete(verifyJwt, deleteReactionOnComment)

export default router;