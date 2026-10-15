import Timer from "@/components/Timer";
import { generateScramble } from "@/services/scramble-service";

export default async function TimerPage() {
  const initialScramble = await generateScramble();

  return <Timer initialScramble={initialScramble} />;
}
