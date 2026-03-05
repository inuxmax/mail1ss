import { NextRequest } from "next/server";

import { FeatureMap, getDomainsByFeatureClient } from "@/lib/dto/domains";
import { getMultipleConfigs } from "@/lib/dto/system-config";
import { checkUserStatus } from "@/lib/dto/user";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";
const EMAIL_PRO_DOMAINS_KEY = "email_pro_domains";

// Get domains by feature for frontend
export async function GET(req: NextRequest) {
  try {
    const user = checkUserStatus(await getCurrentUser());
    if (user instanceof Response) return user;

    const url = new URL(req.url);
    const feature = url.searchParams.get("feature") || "";

    if (!Object.keys(FeatureMap).includes(feature)) {
      return Response.json(
        "Invalid feature parameter. Use 'short', 'email', or 'record'.",
        {
          status: 400,
        },
      );
    }

    const domainList = await getDomainsByFeatureClient(FeatureMap[feature]);

    if (feature === "email") {
      const configs = await getMultipleConfigs([EMAIL_PRO_DOMAINS_KEY]);
      const proDomains = new Set(
        Array.isArray(configs[EMAIL_PRO_DOMAINS_KEY])
          ? configs[EMAIL_PRO_DOMAINS_KEY]
          : [],
      );
      const isFreePlan = (user.team || "").toLowerCase() === "free";
      const emailDomainList = domainList.map((domain) => ({
        ...domain,
        isPro: isFreePlan && proDomains.has(domain.domain_name),
      }));

      return Response.json(emailDomainList, { status: 200 });
    }

    return Response.json(domainList, { status: 200 });
  } catch (error) {
    console.error("[Error]", error);
    return Response.json(error.message || "Server error", { status: 500 });
  }
}
