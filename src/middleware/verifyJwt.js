import jwt from 'jsonwebtoken';
import { asyncHandler } from '../util/asyncHandler.js';
import { APIerror } from '../util/APIerror.js';
import { User } from '../model/User.model.js';

export const verifyJwt = asyncHandler(async (req, res, next) => {
    try {
        const token = req?.cookies['accessToken'] || req.headers['authorization']?.replace("Bearer ", "");

        if (!token) {
            throw new APIerror(404, "Unauthorised acceas");
        }

        const payload = await jwt.verify(token, process.env.ACCESS_TOCKEN_SECRET);

        const user = await User.findById(payload._id);

        if (!user) {
            throw new APIerror(404, "Unauthorised acceas");
        }

        req.user = user;

        next();
    } catch (error) {
        throw new APIerror(400, "Verification failed or user not exits");
    }
})