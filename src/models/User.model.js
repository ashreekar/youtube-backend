import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// userschema
const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,
            required: true,
        },
        coverImage: {
            type: String,
        },
        // channel will be empty initally
        channel: [
            {
                type: Schema.Types.ObjectId,
                ref: "Channel"
            }
        ],
        // subscribed to have list of subscribed channels
        subscribedTo: [
            {
                type: Schema.Types.ObjectId,
                ref: "Channel"
            }
        ],
        // watch history will store watch history
        watchhistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        // password is stored and hashed
        password: {
            type: String,
            required: [true, 'Password is required'],
        }
    },
    {
        timestamps: true
    }
);

// pre hook runs on every svae but hashes password on every password modification
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
})

// this method runs to check password is correct
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

// this model genreates acceas token for user on login
userSchema.methods.generateAcceasToken = async function () {
    const payload = {
        _id: this._id,
        fullName: this.fullName,
        username: this.username,
        email: this.email
    }

    return await jwt.sign(
        payload,
        process.env.ACCESS_TOCKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOCKEN_EXPIRY
        }
    );
}

export const User = mongoose.model("User", userSchema);