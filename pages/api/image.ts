// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import S3 from "aws-sdk/clients/s3";
import { randomUUID } from "crypto";

const s3 = new S3({
  apiVersion: "2006-03-01",
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
  region: process.env.REGION,
  signatureVersion: "v4",
});

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  const ex = (req.query.fileType as string).split("/")[0];
  console.log(ex);
  const Key = `${randomUUID()}.${ex}`;

  const s3Params = {
    Bucket: process.env.BUCKET_NAME,
    Key, 
    Expires: 60,
    ContentType: `image/${ex}`,
  };

  try {
    const uploadUrl = await s3.getSignedUrl("putObject", s3Params);

    console.log("uploadUrl", uploadUrl);
    res.setHeader("Content-Disposition", `inline; filename="${Key}"`);
    res.setHeader("Content-Type", `image/${ex}`);
    res.status(200).json({
      uploadUrl,
      key: Key,
    });
  } catch (error) {
    res.status(400).json({
      error,
    });
  }
}
