import { Router } from 'express';
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from '../middleware/verifyJwt.js';

import {
    createUser,
    deleteUser,
    getUser,
    loginUser,
    logoutUser,
    updateAvatar,
    updateCoverImage,
    updateUserDetails
} from '../controller/user.controller.js';
import { verifyCreateUser } from '../middleware/input.userfields.verify.js';
import { checkForFiles } from '../middleware/checkforfile.middleware.js';

const router = Router();

// get user route to get a user info, update user details(loggedin), delete user(loggedin)
router
    .route('/')
    .get(verifyJwt, getUser)
    .put(verifyJwt, updateUserDetails)
    .delete(verifyJwt, deleteUser);

//crete user route to create new user
router
    .route('/create')
    .post(upload.fields([{
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }]),
        verifyCreateUser,
        checkForFiles,
        createUser);

// route to login user
router.route('/login').post(loginUser);

// route to logout user
router.route('/logout').post(verifyJwt, logoutUser);

// route to update avatar of user
router
    .route('/avatar')
    .put(verifyJwt, upload.fields([{ name: "avatar", maxCount: 1 }]), checkForFiles, updateAvatar);

// route to update bannr of user
router
    .route('/cover')
    .put(verifyJwt, upload.fields([{ name: "coverImage", maxCount: 1 }]), checkForFiles, updateCoverImage);

export default router;