import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error("please define the DB URI in the env");
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { connection: null, promise: null };
}

export async function connectToDB() {
    if (cached.connection) {
        return cached.connection;
    }
    if (!cached.promise) {
        const opts = {
            bufferCommands: true,
            maxPoolSize: 10,
        };
        cached.promise = mongoose
                        .connect(MONGODB_URI, opts)
                        .then(() => mongoose.connection);
    }
    try {
        cached.connection = await cached.promise;
    } catch (error) {
        cached.promise = null;
        console.log("error while connecting db");
        throw error;
    }

    return cached.connection;
}
