import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createS3Client } from "@/lib/s3";
import { getMultipleConfigs } from "@/lib/dto/system-config";
import { getCurrentUser } from "@/lib/session";
import { generateFileKey } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  
  if (!file) {
    return new NextResponse("No file uploaded", { status: 400 });
  }

  const configs = await getMultipleConfigs(["s3_config_list"]);
  if (!configs?.s3_config_list || !Array.isArray(configs.s3_config_list) || configs.s3_config_list.length === 0) {
    return new NextResponse("S3 not configured", { status: 500 });
  }

  // Use the first provider and first bucket
  const provider = configs.s3_config_list[0];
  const bucket = provider.buckets?.[0];

  if (!bucket) {
    return new NextResponse("No bucket configured", { status: 500 });
  }

  const s3 = createS3Client(
    provider.endpoint,
    provider.access_key_id,
    provider.secret_access_key
  );

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = generateFileKey(file.name, "posts");
  const contentType = file.type;

  try {
    await s3.send(new PutObjectCommand({
      Bucket: bucket.bucket,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
      // ACL: "public-read", // S3 ACLs might be disabled on some providers (like R2)
    }));

    // Construct public URL
    let url = "";
    if (bucket.custom_domain) {
      // Ensure custom_domain doesn't end with slash and fileName doesn't start with slash (generateFileKey usually doesn't)
      const domain = bucket.custom_domain.replace(/\/$/, "");
      if (domain.startsWith("http")) {
        url = `${domain}/${fileName}`;
      } else {
        url = `https://${domain}/${fileName}`;
      }
    } else {
       // Fallback logic
       const endpoint = provider.endpoint.replace(/\/$/, "");
       url = `${endpoint}/${bucket.bucket}/${fileName}`;
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return new NextResponse("Upload failed", { status: 500 });
  }
}
