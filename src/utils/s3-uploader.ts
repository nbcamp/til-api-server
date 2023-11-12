import S3, { S3Client } from "@aws-sdk/client-s3";
import { format } from "date-fns";
import { v4 as uuid } from "uuid";

const client = new S3Client({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: Bun.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: Bun.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const bucket = "tlog-bucket";

export async function upload(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `dev/${format(Date.now(), "yyyy/MM/dd")}/${uuid()}${
    ext ? `.${ext}` : ""
  }`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await client.send(
      new S3.PutObjectCommand({
        Bucket: bucket,
        Key: path,
        Body: buffer,
        ContentType: file.type,
      }),
    );
    return `https://s3.ap-northeast-2.amazonaws.com/${bucket}/${path}`;
  } catch (error) {
    console.error(error);
    throw new Error("파일 업로드에 실패했습니다.");
  }
}
