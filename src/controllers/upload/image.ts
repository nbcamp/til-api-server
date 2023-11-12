import { createRouter } from "router";
import { HttpError } from "utils/http";
import * as uploader from "utils/s3-uploader";

export const uploadImage = createRouter({
  method: "POST",
  description: "이미지 파일을 업로드합니다.",
  authorized: true,
  async handler(ctx): Promise<{ url: string }> {
    const formData = await ctx.request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      throw new HttpError("파일을 찾을 수 없습니다.", "BAD_REQUEST");
    }
    const url = await uploader.upload(file);
    return { url };
  },
});
