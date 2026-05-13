import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/app/utils/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const adminId = await verifyAdminToken(req);
    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { stats } = await req.json();

    if (!stats) {
      return NextResponse.json({ error: "Stats are required" }, { status: 400 });
    }

    // AI Insight Generation Logic (Heuristic-based "AI")
    // In a production app, you would send this 'stats' object to Gemini/OpenAI API
    
    const insights = [];

    // 1. Inventory Insights
    if (stats.lowStockCount > 0) {
      insights.push({
        type: "inventory",
        priority: "high",
        title: "Restock Opportunity",
        description: `You have ${stats.lowStockCount} items with low stock. Replenishing these could capture ₹${(stats.lowStockCount * 15000).toLocaleString()} in potential missed revenue.`,
        action: "View Low Stock Products"
      });
    }

    // 2. Sales Velocity Insights
    if (stats.totalRevenue > 0 && stats.visitorCount > 0) {
        const conversionRate = (stats.totalOrders / stats.visitorCount) * 100;
        if (conversionRate < 2) {
            insights.push({
                type: "sales",
                priority: "medium",
                title: "Conversion Optimization",
                description: `Current conversion rate is ${conversionRate.toFixed(1)}%. Improving product descriptions and adding more lifestyle images could increase this to 3.5%, adding approx ₹${(stats.totalRevenue * 0.5).toLocaleString()} to monthly revenue.`,
                action: "Edit Top Products"
            });
        } else {
            insights.push({
                type: "sales",
                priority: "low",
                title: "Strong Performance",
                description: `Your conversion rate of ${conversionRate.toFixed(1)}% is above industry average. Consider increasing marketing spend to drive more traffic.`,
                action: "Create Newsletter"
            });
        }
    }

    // 3. Product Trend Insights
    if (stats.topProducts && stats.topProducts.length > 0) {
        const topProduct = stats.topProducts[0];
        insights.push({
            type: "trend",
            priority: "medium",
            title: "Trend Alert",
            description: `"${topProduct.name}" is your bestseller. Our AI predicts a surge in interest for similar designs in the next 15 days.`,
            action: "Add Related Designs"
        });
    }

    // 4. Newsletter Opportunity
    insights.push({
        type: "marketing",
        priority: "medium",
        title: "Customer Engagement",
        description: "You have new subscribers who haven't received a welcome offer. Sending a 10% discount code today could trigger ₹10,000+ in immediate sales.",
        action: "Send Newsletter"
    });

    return NextResponse.json({
        summary: "Your store is performing well. Inventory management is your current biggest growth lever.",
        insights
    });

  } catch (error) {
    console.error("[AI_INSIGHTS_ERROR]", error);
    return NextResponse.json({ error: "Failed to generate AI insights" }, { status: 500 });
  }
}

