import { Router } from "express";
import { verifyJwt } from "../middleware/verifyJwt.js"
import {
    commentOnCommnent,
    commentOnPost,
    commentOnVideo,
    deleteComment,
    getCommentOfComment,
    getCommentOfPost,
    getCommentOfVideo,
    updateComment,
} from "../controller/comment.controller.js";

const router = Router();

// "/id" to upadate and delete comment for video,post, comment
router
    .route('/:id')
    .put(verifyJwt, updateComment)
    .delete(verifyJwt, deleteComment)

// get comment by id for video or post comment
router
    .route('/video/:id')
    .get(getCommentOfVideo)
    .post(verifyJwt, commentOnVideo)

// get comment by id for post or post comment
router
    .route('/comment/:id')
    .get(getCommentOfComment)
    .post(verifyJwt, commentOnCommnent)

// get comment by id for comment or post comment
router
    .route('/post/:id')
    .get(getCommentOfPost)
    .post(verifyJwt, commentOnPost)

export default router;