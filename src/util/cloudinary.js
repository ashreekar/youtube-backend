import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration of cludinay
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// function to upload a resource oncludinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder:"youtube/"
        });

        console.log("✅ File uploaded securely 🌐", response.url);
        // deteing after upload from cloudinary
        // resource will be in public
        fs.unlinkSync(localFilePath);
        return response;

    } catch (err) {
        fs.unlinkSync(localFilePath);
        return null;
    }

}

const deleteOnCloudinary = async (fileUrl) => {
    try {
        if (!fileUrl) return null;

        const cleanUrl = fileUrl.split("?")[0];

        const parts = cleanUrl.split("/upload/")[1];

        const withoutVersion = parts.substring(parts.indexOf("/") + 1);

        const publicId = withoutVersion.replace(/\.[^/.]+$/, "");

        const deletedKey = await cloudinary.uploader.destroy(publicId);
        console.log("✅ File deleted securely 🌐", deletedKey);
        return deletedKey;

    } catch (err) {
        console.error("❌ Error deleting file from Cloudinary:", err);
        return null;
    }
};

export { uploadOnCloudinary, deleteOnCloudinary };