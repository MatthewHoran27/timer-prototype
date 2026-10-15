import { generateScramble } from "@/services/scramble-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const scramble = await generateScramble();
    return Response.json({ scramble });
  } catch (error) {
    console.error("Unable to generate scramble:", error);
    return Response.json(
      { error: "Could not generate scramble." },
      { status: 500 },
    );
  }
}
