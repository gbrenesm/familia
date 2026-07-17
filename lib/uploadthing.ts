import { createUploadthing, type FileRouter } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  documentUploader: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 5 },
    image: { maxFileSize: "8MB", maxFileCount: 5 },
  }).onUploadComplete(({ file }) => {
    return { url: file.ufsUrl };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
