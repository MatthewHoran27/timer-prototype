export async function generateScramble(): Promise<string> {
  const { randomScrambleForEvent } = await import("cubing/scramble");
  
  // TODO: ADD: Add support for different events in the future.
  const scramble = await randomScrambleForEvent("333");

  return scramble.toString();
}

export async function drawScramble(scramble: string) {
  const { TwistyPlayer } = await import("cubing/twisty");

  // TODO: ADD: Add support for 3D visualization and control panel options in the future.
  const player = new TwistyPlayer({
    puzzle: "3x3x3",
    alg: "",
    experimentalSetupAlg: scramble,
    visualization: "2D",
    controlPanel: "none",
    background: "none",
  });

  player.style.width = "min(90vw, 240px)";
  player.style.height = "160px";

  return player;
}
