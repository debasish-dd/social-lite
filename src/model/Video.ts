import mongoose, { Schema, model, models } from "mongoose";

export const videoDimentions = {
    width: 1080,
    height: 1920
} as const

export interface IVideos {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    videoURL: string;
    thumbnailURL: string;
    controls?: boolean;
    transformation?: {
        height: number,
        width: number,
        quality?: number
    }
}

const videoSchema = new Schema<IVideos> ({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    videoURL: {
        type: String,
        required: true
    },
    thumbnailURL: {
        type: String,
        required: true
    },
    controls: {
        type: Boolean,
        default: true,
    },
    transformation: {
        height: {
            type: Number,
            default: videoDimentions.height
        },
        width: {
            type: Number,
            default: videoDimentions.width
        },
         quality: {
            type: Number,
            min: 1,
            max: 100
        },
    }

}, {timestamps: true})


const Video = models?.Video || model<IVideos>("Video", videoSchema);

export default Video;