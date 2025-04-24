import { prisma } from "@/lib/db";
import { stripe } from "@/lib/payments/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(new URL("/pricing", request.url));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    // For one-time payments, we only need to verify the payment status
    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const userId = session.client_reference_id;
    if (!userId) {
      throw new Error("No user ID found in session's client_reference_id.");
    }

    // Get the price ID from the session
    const priceId = session.line_items?.data[0]?.price?.id;
    if (!priceId) {
      throw new Error("No price ID found in session.");
    }

    // Update user to mark them as paid and store the price ID
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hasPaid: true,
        paidAt: new Date(),
        stripePriceId: priceId,
      },
    });

    // Redirect to a success page that will handle session update and dashboard redirect
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error handling successful checkout:", errorMessage);
    return NextResponse.redirect(
      new URL("/pricing?error=payment-failed", request.url)
    );
  }
}
