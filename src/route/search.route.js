import { Router } from "express";
import { searchVideos } from "../controller/search.controller.js";

const router = Router();

// route to get videos on search
router.route('/').get(searchVideos);

export default router;