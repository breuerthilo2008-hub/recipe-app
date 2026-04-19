// frontend/src/app/api/upload/route.ts
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

/**
 * serverless route to facilitate secure client-side uploads to Vercel Blob.
 * It uses the 'handleUpload' function to verify tokens and permissions.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (
        pathname,
        /* clientPayload */
      ) => {
        /**
         * Here you can check the session to see if the user is logged in
         * and have permissions to upload to this pathname.
         */
        // For now, we allow all authenticated users (handled by your middleware if any)
        // or just return basic configuration.
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          tokenPayload: JSON.stringify({
            // optional, sent to your server on upload completion
            userId: 'user_id_here', 
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This callback is called on your server after the upload is completed.
        // You can use this to update your database.
        console.log('Blob upload completed:', blob, tokenPayload);

        try {
          // You could potentially trigger a DB update here,
          // but we will do it from the frontend to keep the flow simple.
        } catch (error) {
          throw new Error('Could not update user');
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }, // The client will also get this error
    );
  }
}
