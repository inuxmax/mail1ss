import { prisma } from "@/lib/db";

export async function getSiteAnalytics() {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const [siteVisits, activeSiteUsers] = await prisma.$transaction([
      prisma.siteVisit.count(),
      prisma.siteVisit.groupBy({ 
        by: ['ip'], 
        where: { createdAt: { gte: fifteenMinutesAgo } } 
      })
    ]);

    const totalVisits = siteVisits;
    
    // Real-time users from SiteVisit (page views)
    const uniqueIPs = new Set([
      ...activeSiteUsers.map(u => u.ip),
    ]);
    
    let realTimeUsers = uniqueIPs.size;

    return {
      totalVisits,
      realTimeUsers
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return {
      totalVisits: 0,
      realTimeUsers: 0
    };
  }
}
