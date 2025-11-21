import jwt from 'jsonwebtoken';
import { asyncHandler } from '../util/asyncHandler.js';
import { APIerror } from '../util/APIerror.js';
import { User } from '../model/User.model.js';

export const verifyJwt = asyncHandler(async (req, __dirname, next) => {
    const token = req?.cookies['sgAcceasToken'] || req.headers['authorization']?.replace("Bearer ", "");

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
})