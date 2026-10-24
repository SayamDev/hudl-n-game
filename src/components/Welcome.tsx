import { useEffect, useState } from "react";
import { ArrowRight, HandPalm, LockKey, X } from "@phosphor-icons/react";
import { lobbyGames } from "../games/registry";
import { Dialog } from "./Dialog";
import { Identity } from "./Identity";
import { avatars } from "../store/useGame";
import { Button } from "./ui";

export default function Welcome({
  onClose,
  onStart,
}: {
  onClose: () => void;
  onStart: () => void;
}) {
  const [step, setStep] = useState(0);
  const [peek, setPeek] = useState(false);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const hide = () => setPeek(false);
    window.addEventListener("blur", hide);
    document.addEventListener("visibilitychange", hide);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("blur", hide);
      document.removeEventListener("visibilitychange", hide);
    };
  }, []);
  return (
    <div className="modal-backdrop welcome-backdrop">
      <Dialog label="welcome-title" onClose={onClose}>
        <div className="welcome-top">
          <button
            className="icon-button"
            aria-label="Skip welcome"
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </div>
        <div className={`welcome-scene welcome-scene-${step}`}>
          {step === 0 ? (
            <div className="welcome-cast" aria-hidden="true">
              {[0, 3, 1].map((i) => (
                <Identity key={i} seed={avatars[i]} large />
              ))}
            </div>
          ) : step === 1 ? (
            <div
              className={`welcome-secret ${peek ? "is-open" : ""}`}
              aria-live="polite"
            >
              <LockKey size={32} />
              <strong>{peek ? "PINEAPPLE" : "TOP SECRET"}</strong>
              <span>
                {peek
                  ? "Release to hide it again."
                  : "A practice word. Just for you."}
              </span>
            </div>
          ) : (
            <div className="welcome-ticket">
              <strong>
                Good friends.
                <br />
                Bad alibis.
              </strong>
              <span>3–20 players · No accounts needed</span>
            </div>
          )}
        </div>
        <h2 id="welcome-title">
          {
            [
              "Your party starts here.",
              "A secret worth keeping.",
              "Get the crew together.",
            ][step]
          }
        </h2>
        <p>
          {
            [
              `Add your names, pick a game and pass the phone. ${lobbyGames.length} games for bluffing, acting and getting to know your crew.`,
              "Only the named player looks. In Imposter, swipe up and keep your finger down to read, or hold the reveal button. Lift your finger to hide before passing to the next name. Try holding below.",
              "Give everyone a name and an alibi. Start with Imposter, or explore the other games — each has its own quick rules.",
            ][step]
          }
        </p>
        {step === 1 && (
          <Button
            className="welcome-hold"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              setPeek(true);
            }}
            onPointerUp={() => setPeek(false)}
            onPointerCancel={() => setPeek(false)}
            onLostPointerCapture={() => setPeek(false)}
            onBlur={() => setPeek(false)}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                setPeek(true);
              }
            }}
            onKeyUp={() => setPeek(false)}
          >
            <HandPalm size={24} /> Hold to try it
          </Button>
        )}
        <div
          className="welcome-progress"
          role="img"
          aria-label={`Step ${step + 1} of 3`}
        >
          {[0, 1, 2].map((i) => (
            <span key={i} data-current={i <= step} />
          ))}
        </div>
        <div className="welcome-actions">
          {step > 0 && (
            <Button
              onClick={() => {
                setPeek(false);
                setStep(step - 1);
              }}
            >
              Back
            </Button>
          )}
          <Button
            className="primary"
            onClick={() => {
              setPeek(false);
              step === 2 ? onStart() : setStep(step + 1);
            }}
          >
            {step === 2 ? "Add my crew" : "Next"}
            <ArrowRight size={22} />
          </Button>
        </div>
        <button className="text-button welcome-skip" onClick={onClose}>
          I’ll explore on my own
        </button>
      </Dialog>
    </div>
  );
}
