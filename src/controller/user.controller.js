import { User } from "../model/User.model.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { APIerror } from "../util/APIerror.js";
import { APIresponse } from "../util/APIresponse.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../util/cloudinary.js";

// Models import
import { Video } from "../model/Video.model.js";
import { Channel } from "../model/Channel.model.js";
import { Comment } from "../model/Comment.model.js";
import { Playlist } from "../model/Playlist.model.js";
import { Post } from "../model/Post.model.js";
import { Reaction } from "../model/Reaction.model.js";

const generateLoginToken = async (id) => {
    try {
        const user = await User.findById(id);

        const acceastoken = await user.generateAcceasToken();

        return { acceastoken };
    } catch (error) {
        throw new APIerror(500, "Something went wrong while generating access token")
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
            avatar: avatar.url,
            watchhistory: [],
            password,
            coverImage: coverImage.url
        }
    )

    const { acceastoken } = await generateLoginToken(user._id);

    const loggeduser = await User.findById(user._id).
        select("-password -watchhistory -createdAt -updatedAt")

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
        throw new APIerror(400, "Username or email required");
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
        select("-password -watchhistory -createdAt -updatedAt")

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
            }, "Login sucessfull")
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

const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select("-password -createdAt -updatedAt")
        .populate("channel").select("-updatedAt")
        .populate("subscribedTo").select("-owner -videos -subscribers -playlist -posts -createdAt -updatedAt")

    if (!user) {
        throw new APIerror(404, "User not found");
    }

    return res.status(200).json(new APIresponse(200, user, "user fetched sucessfully"));
})

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req?.files?.avatar[0]?.path;

    if (!avatarLocalPath) {
        throw new APIerror(400, "Avatar is needed to update avatar");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    const url = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { avatar: avatar.url }
        },
        {
            new: true
        }
    )
        .select("avatar")

    res.status(201).json(new APIresponse(201, url, "avatar changed"));
})

const updateCoverImage = asyncHandler(async (req, res) => {
    const coverLocalPath = req?.files?.coverImage[0]?.path;

    if (!coverLocalPath) {
        throw new APIerror(400, "Cover image is needed to update cover image");
    }

    const coverImage = await uploadOnCloudinary(coverLocalPath);

    const url = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { coverImage: coverImage.url }
        },
        {
            new: true
        }
    )
        .select("coverImage")

    res.status(201).json(new APIresponse(201, url, "cover image changed"));
})

const updateUserDetails = asyncHandler(async (req, res) => {
    const body = req.body;

    const isExisting = await User.findOne({
        $or: [
            { username: body?.username },
            { email: body?.email }
        ]
    });

    if (isExisting && isExisting._id.toString() !== req.user._id.toString()) {
        throw new APIerror(400, "User with username or email already exists");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { ...body } },
        { new: true }
    ).select("-password -createdAt -updatedAt");

    return res.status(200).json(
        new APIresponse(200, user, "User details updated")
    );
})

const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.user._id);

    if (user.channel?.length > 0) {
        const channel = await Channel.findByIdAndDelete(user.channel[0]);
        await Video.findOneAndDelete({ owner: channel._id });
        await Playlist.findOneAndDelete({ postedBy: channel._id });
        await Post.findOneAndDelete({ postedBy: channel._id });
    }

    await Comment.findOneAndDelete({ commenter: user._id });
    await Reaction.findOneAndDelete({ reactionBy: user._id });

    return res.status(201).json(new APIresponse(201, null, "user deleted"));
})

export {
    createUser,
    loginUser,
    logoutUser,
    getUser,
    updateAvatar,
    updateCoverImage,
    updateUserDetails,
    deleteUser
};