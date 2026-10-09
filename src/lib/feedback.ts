import { useGame } from "../store/useGame";
let audio: AudioContext | undefined;
export function feedback(kind: "tap" | "success" | "wrong" | "tick" = "tap") {
  const p = useGame.getState().preferences;
  if (p.haptics && navigator.vibrate)
    navigator.vibrate(kind === "success" ? [35, 40, 60] : 15);
  if (!p.sound) return;
  try {
    audio ??= new AudioContext();
    void audio.resume();
    const osc = audio.createOscillator(),
      gain = audio.createGain();
    osc.connect(gain);
    gain.connect(audio.destination);
    const t = audio.currentTime;
    osc.frequency.setValueAtTime(
      kind === "success"
        ? 523
        : kind === "wrong"
          ? 180
          : kind === "tick"
            ? 750
            : 420,
      t,
    );
    osc.frequency.exponentialRampToValueAtTime(
      kind === "success" ? 1046 : kind === "wrong" ? 90 : 600,
      t + 0.1,
    );
    gain.gain.setValueAtTime(p.volume * 0.13, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    osc.start();
    osc.stop(t + 0.17);
  } catch {
    /* Sound is optional. */
  }
}
export function speak(text: string) {
  const p = useGame.getState().preferences;
  if (!p.narrator || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = p.rate;
  u.volume = p.volume;
  u.voice =
    window.speechSynthesis.getVoices().find((v) => v.voiceURI === p.voice) ||
    null;
  window.speechSynthesis.speak(u);
}
export function silence() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
