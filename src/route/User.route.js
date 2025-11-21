import { Router } from 'express';
import { upload } from "../middleware/multer.middleware.js";
import { createUser, loginUser, logoutUser } from '../controller/user.controller.js';

const router = Router();

router
    .route('/create')
    .post(upload.fields(["coverImage", "avatar"]), createUser);

router.route('/login').post(loginUser);
router.route('/logout').post(logoutUser);

export default router;