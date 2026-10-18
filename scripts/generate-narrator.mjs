// Requires the user's local VoiceStudio app, with its installed MLX Qwen3 VoiceDesign engine.
// Only fixed public instructions are sent to localhost. No player names or secrets.
import fs from "node:fs/promises";
const lines = JSON.parse(
  await fs.readFile(
    new URL("../src/content/narration.json", import.meta.url),
    "utf8",
  ),
);
const voices = {
  storyteller:
    "A warm, low-pitched adult male voice with a clear British accent. Calm, intimate storytelling for a friendly mystery party. Speak naturally, with short pauses and quiet suspense, never theatrical or robotic.",
  host: "A warm adult female voice with a clear British accent. Friendly, relaxed and reassuring, guiding friends through a mystery party game. Natural conversational delivery, with short pauses, never theatrical or robotic.",
};
for (const [voice, instruct] of Object.entries(voices)) {
  for (const [id, input] of Object.entries(lines)) {
    const response = await fetch("http://127.0.0.1:3900/v1/audio/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mlx-audio",
        voice: "default",
        input,
        instruct,
        language: "en",
        seed: 42,
        speed: 1,
        response_format: "mp3",
      }),
      signal: AbortSignal.timeout(180000),
    });
    if (!response.ok)
      throw Error(`VoiceStudio ${response.status}: ${await response.text()}`);
    const audio = Buffer.from(await response.arrayBuffer());
    if (audio.length < 1000) throw Error("VoiceStudio returned an empty clip");
    await fs.writeFile(
      new URL(`../public/audio/narrator/${voice}-${id}.mp3`, import.meta.url),
      audio,
    );
    console.log(`${voice}/${id}: ${audio.length} bytes`);
  }
}
