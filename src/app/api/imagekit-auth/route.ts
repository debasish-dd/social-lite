// File: app/api/upload-auth/route.ts
import { getUploadAuthParams } from "@imagekit/next/server"

export async function GET() {
    

 try {
       const { token, expire, signature } = getUploadAuthParams({
           privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
           publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
           expire: 5* 30 * 60, 
           // token: "random-token", // Optional, a unique token for request
       })
   
       return Response.json({ token, expire, signature, publicKey: process.env.IMAGEKIT_PUBLIC_KEY })
   
       
 } catch (error) {
    return Response.json({ error: "Failed to generate upload auth parameters" }, { status: 500 })
 }
}