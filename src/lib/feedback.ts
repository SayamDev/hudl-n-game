import { useGame } from "../store/useGame";
import narration from "../content/narration.json";
import { countdownCue } from "./countdown";
let countdownNodes: OscillatorNode[] = [];
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
let narrationAudio: HTMLAudioElement | undefined;
let speechToken = 0;
export function speak(text: string, preview = false) {
  const p = useGame.getState().preferences;
  if (!p.narrator && !preview) return;
  silence();
  const token = speechToken;
  let fallbackUsed = false;
  const fallback = () => {
    if (
      fallbackUsed ||
      token !== speechToken ||
      !("speechSynthesis" in window) ||
      document.hidden
    )
      return;
    fallbackUsed = true;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = p.rate;
    u.volume = p.volume;
    u.lang = "en-GB";
    u.voice =
      window.speechSynthesis.getVoices().find((v) => v.voiceURI === p.voice) ||
      null;
    window.speechSynthesis.speak(u);
  };
  const id = Object.entries(narration).find(
    ([, script]) => script === text,
  )?.[0];
  if (id && (!p.voice || p.voice.startsWith("studio:"))) {
    const voice = p.voice === "studio:host" ? "host" : "storyteller";
    narrationAudio = new Audio(
      `${import.meta.env.BASE_URL}audio/narrator/${voice}-${id}.mp3`,
    );
    narrationAudio.volume = p.volume;
    narrationAudio.playbackRate = p.rate / 0.9;
    narrationAudio.onerror = fallback;
    void narrationAudio.play().catch(fallback);
  } else fallback();
}
export function silence() {
  speechToken++;
  stopCountdown();
  if (narrationAudio) {
    narrationAudio.pause();
    narrationAudio.onerror = null;
    narrationAudio.removeAttribute("src");
    narrationAudio = undefined;
  }
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
export function stopCountdown() {
  countdownNodes.forEach((node) => {
    try {
      node.stop();
    } catch {
      /* Already ended. */
    }
  });
  countdownNodes = [];
}
export function countdownSound(seconds: number) {
  stopCountdown();
  const p = useGame.getState().preferences;
  if (
    !p.sound ||
    p.volume <= 0 ||
    p.countdown === false ||
    document.hidden ||
    !document.hasFocus()
  )
    return;
  try {
    audio ??= new AudioContext();
    if (audio.state !== "running") return; // Unlocked by the player's start/continue tap.
    const time = audio.currentTime;
    for (const cue of countdownCue(seconds)) {
      const osc = audio.createOscillator(),
        gain = audio.createGain();
      osc.type = "sine";
      osc.frequency.value = cue.frequency;
      osc.connect(gain);
      gain.connect(audio.destination);
      gain.gain.setValueAtTime(0, time + cue.at);
      gain.gain.linearRampToValueAtTime(p.volume * 0.16, time + cue.at + 0.012);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        time + cue.at + cue.duration,
      );
      osc.start(time + cue.at);
      osc.stop(time + cue.at + cue.duration + 0.02);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
        countdownNodes = countdownNodes.filter((node) => node !== osc);
      };
      countdownNodes.push(osc);
    }
  } catch {
    /* Optional audio never blocks a round. */
  }
}
