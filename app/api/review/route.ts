import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { generateReviewReport } from "@/lib/review";
import { reviewReportSchema, reviewRequestSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = reviewRequestSchema.parse(body);
    const review = await generateReviewReport(payload);
    const validatedReview = reviewReportSchema.parse(review);

    return NextResponse.json(validatedReview);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid review request.",
          details: error.flatten(),
        },
        { status: 400 },
      );
    }

    console.error("Unable to generate review report.", error);

    return NextResponse.json(
      {
        error: "Unable to generate review report.",
      },
      { status: 500 },
    );
  }
}
