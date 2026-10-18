import { useEffect, useState } from "react";
import { useGame } from "../store/useGame";
import { Button, Screen, Toggle } from "./ui";
import narration from "../content/narration.json";
import { speak, silence } from "../lib/feedback";
export default function Preferences() {
  const { preferences: p, setPreferences, resetScores } = useGame();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [scene, setScene] = useState<"preview" | "night" | "dawn">("night");
  useEffect(() => {
    const stop = () => silence();
    window.addEventListener("blur", stop);
    document.addEventListener("visibilitychange", stop);
    return () => {
      silence();
      window.removeEventListener("blur", stop);
      document.removeEventListener("visibilitychange", stop);
    };
  }, []);
  const [reset, setReset] = useState(false);
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const load = () => setVoices(speechSynthesis.getVoices());
    load();
    speechSynthesis.addEventListener("voiceschanged", load);
    return () => speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);
  return (
    <Screen
      title="Your party, your rules."
      subtitle="These settings stay on this device."
    >
      <fieldset className="design-picker">
        <legend>Design</legend>
        <p>
          Try Social Club, or switch back to the original look anytime. Your
          crew and scores stay saved.
        </p>
        <div className="split">
          <Button
            aria-pressed={
              p.design !== "classic" && p.design !== "club-original"
            }
            className={
              p.design !== "classic" && p.design !== "club-original"
                ? "primary"
                : ""
            }
            onClick={() => setPreferences({ design: "club" })}
          >
            Social Club
          </Button>
          <Button
            aria-pressed={p.design === "club-original"}
            className={p.design === "club-original" ? "primary" : ""}
            onClick={() => setPreferences({ design: "club-original" })}
          >
            Social Club original
          </Button>
          <Button
            aria-pressed={p.design === "classic"}
            className={p.design === "classic" ? "primary" : ""}
            onClick={() => setPreferences({ design: "classic" })}
          >
            Classic
          </Button>
        </div>
      </fieldset>
      <Toggle
        label="Dark party mode"
        checked={p.dark}
        onChange={(dark) => setPreferences({ dark })}
      />
      <Toggle
        label="Family-friendly"
        description="Hides adult packs and keeps prompts family-safe."
        checked={p.family}
        onChange={(family) =>
          setPreferences({ family, adult: family ? false : p.adult })
        }
      />
      {!p.family && (
        <Toggle
          label="I’m 18+ and want adult content"
          description="Explicit opt-in. You can still skip any prompt."
          checked={p.adult}
          onChange={(adult) => setPreferences({ adult })}
        />
      )}
      <Toggle
        label="Sound effects"
        checked={p.sound}
        onChange={(sound) => setPreferences({ sound })}
      />
      <Toggle
        label="Countdown soundtrack"
        description="Gentle pulses build at 1 minute, 30 seconds and the final 10. Follows Sound effects and Volume."
        checked={p.countdown !== false}
        onChange={(countdown) => setPreferences({ countdown })}
      />
      <label>
        Volume: {Math.round(p.volume * 100)}%
        <input
          type="range"
          min="0"
          max="1"
          step=".05"
          value={p.volume}
          onChange={(e) => setPreferences({ volume: Number(e.target.value) })}
        />
      </label>
      <Toggle
        label="Haptic feedback"
        description="A little buzz on supported phones."
        checked={p.haptics}
        onChange={(haptics) => setPreferences({ haptics })}
      />
      <Toggle
        label="Spoken Mafia narrator"
        checked={p.narrator}
        onChange={(narrator) => {
          silence();
          setPreferences({ narrator });
        }}
      />
      <section className="voice-studio" aria-labelledby="voice-studio-title">
        <h2 id="voice-studio-title">Voice studio</h2>
        <p>
          A storyteller for the village. Preview a scene, then choose your host.
        </p>
        <label>
          Narrator voice
          <select
            value={p.voice}
            onChange={(e) => {
              silence();
              setPreferences({ voice: e.target.value });
            }}
          >
            <option value="">Village storyteller · British English</option>
            <option value="studio:host">Warm host · British English</option>
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </label>
        <label>
          Narrator speed: {p.rate.toFixed(1)}×
          <input
            type="range"
            min=".6"
            max="1.4"
            step=".1"
            value={p.rate}
            onChange={(e) => setPreferences({ rate: Number(e.target.value) })}
          />
        </label>
        <label>
          Preview scene
          <select
            value={scene}
            onChange={(e) => {
              silence();
              setScene(e.target.value as typeof scene);
            }}
          >
            <option value="night">Night falls</option>
            <option value="dawn">Morning reveal</option>
            <option value="preview">Welcome to the village</option>
          </select>
        </label>
        <div className="split">
          <Button onClick={() => speak(narration[scene], true)}>
            Test narrator
          </Button>
          <Button onClick={silence}>Stop preview</Button>
        </div>
        <p className="helper">
          AI-generated VoiceStudio recordings for public Mafia instructions.
          Cached for offline play; no voice model download during a game.
          Private roles and secret words are never read aloud. Device voices are
          alternatives and may need internet.
        </p>
      </section>
      <Toggle
        label="Larger text"
        checked={p.largeText}
        onChange={(largeText) => setPreferences({ largeText })}
      />
      <Toggle
        label="High contrast"
        checked={p.contrast}
        onChange={(contrast) => setPreferences({ contrast })}
      />
      {reset ? (
        <div className="notice">
          <p>Reset everyone’s session scores to zero?</p>
          <div className="split">
            <Button
              onClick={() => {
                resetScores();
                setReset(false);
              }}
            >
              Reset scores
            </Button>
            <Button onClick={() => setReset(false)}>Keep scores</Button>
          </div>
        </div>
      ) : (
        <Button className="text-button" onClick={() => setReset(true)}>
          Reset scoreboard
        </Button>
      )}
    </Screen>
  );
}
