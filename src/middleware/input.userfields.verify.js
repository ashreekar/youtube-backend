import { User } from "../model/User.model.js";
import { APIerror } from "../util/APIerror.js";
import { asyncHandler } from "../util/asyncHandler.js";

const usernameRegex = /^[A-Za-z][A-Za-z0-9_]{2,15}$/;
const passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/gm;
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const verifyCreateUser = asyncHandler(async (req, res, next) => {
    const { fullName, username, email, password } = req.body;

    // check all fields are filled
    if ([fullName, username, email, password].some(field => field?.trim() === "")) {
        throw new APIerror(400, "All fields must be filled");
    }

    // check if user exists
    const existedUser = await User.findOne(
        {
            $or: [{ username }, { email }]
        }
    )

    if (existedUser) {
        throw new APIerror(400, "User already exists with username or email");
    }

    if (!usernameRegex.test(username)) {
        throw new APIerror(400, "Invalid username");
    }
    if (!emailRegex.test(email)) {
        throw new APIerror(400, "Invalid email");
    }
    if (!passwordRegex.test(password)) {
        throw new APIerror(400, "Invalid password");
    }

    next();
})

export { verifyCreateUser };