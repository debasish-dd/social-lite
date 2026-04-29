import { getUploadAuthParams } from "@imagekit/next/server";

export async function GET() {
  try {
    const expire = Math.floor(Date.now() / 1000) + 30 * 60; // 30 min from now

    const { token, signature } = getUploadAuthParams({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
      expire,
    });

    return Response.json({
      token,
      expire,
      signature,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    });
  } catch (error) {
    console.error("ImageKit auth error:", error);

    return Response.json(
      { error: "Failed to generate upload auth parameters" },
      { status: 500 }
    );
  }
}