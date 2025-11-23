import { Router } from "express";
import { verifyJwt } from "../middleware/verifyJwt.js"
import { deleteReactionOnComment, deleteReactionOnVideo, deleteReactionPost, getReactionStatusOnComment, getReactionStatusOnPost, getReactionStatusOnVideo, toggleReactionOnComment, toggleReactionOnPost, toggleReactionOnVideo } from "../controller/reaction.controller.js";

const router = Router();

router.route('/video/:id').get(getReactionStatusOnVideo).post(verifyJwt, toggleReactionOnVideo).delete(verifyJwt, deleteReactionOnVideo)

router.route('/post/:id').get(getReactionStatusOnPost).post(verifyJwt, toggleReactionOnPost).delete(verifyJwt, deleteReactionPost)

router.route('/comment/:id').get(getReactionStatusOnComment).post(verifyJwt, toggleReactionOnComment).delete(verifyJwt, deleteReactionOnComment)

export default router;