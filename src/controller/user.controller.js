import { User } from "../model/User.model.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { APIerror } from "../util/APIerror.js";
import { APIresponse } from "../util/APIresponse.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../util/cloudinary.js";

const generateLoginToken = async (id) => {
    try {
        const user = await User.findById(id);

        const acceastoken = await user.generateAcceasToken();

        return { acceastoken };
    } catch (error) {
        throw new APIerror(500, "Somethingwent wrong while generating acces token")
    }
}

const createUser = asyncHandler(async (req, res) => {
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

    const avatarLocalPath = req.files?.avatar[0]?.path;

    if (!avatarLocalPath) {
        throw new APIerror(400, "Avatar is required");
    }

    let coverLocalPath;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverLocalPath = req.files.coverImage[0].path;
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverLocalPath);

    const user = await User.create(
        {
            username,
            email,
            fullName,
            avatar:avatar.url,
            watchhistory: [],
            password,
            coverImage:coverImage.url
        }
    )

    const { acceastoken } = await generateLoginToken(user._id);

    const loggeduser = await User.findById(user._id).
        select("-password -watchhistory")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(201)
        .cookie("accessToken", acceastoken, options)
        .json(
            new APIresponse(
                201,
                {
                    loggeduser,
                    acceastoken
                },
                "User created and logged in sucessfully"
            )
        )
})

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username && !email) {
        throw new APIerror(400, "Username or password required");
    }

    const user = await User.findOne(
        {
            $or: [{ email }, { username }]
        }
    )

    if (!user) {
        throw new APIerror(404, "User not found");
    }

    const isValidPassword = await user.isPasswordCorrect(password);

    if (!isValidPassword) {
        throw new APIerror(401, "Invalid password");
    }

    const { acceastoken } = await generateLoginToken(user._id);

    const loggeduser = await User.findById(user._id).
        select("-password -watchhistory")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", acceastoken, options)
        .json(
            new APIresponse(200, {
                user: loggeduser,
                acceastoken,
            }),
            "Login sucessfull"
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .json(new APIresponse(200, {}, "User logged out"))
})

export { createUser, loginUser, logoutUser };