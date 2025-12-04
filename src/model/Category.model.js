import mongoose from "mongoose";

// category schema have field of name
const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
            lowercase: true
        }
    }
)

export const Category = mongoose.model("Category", categorySchema);