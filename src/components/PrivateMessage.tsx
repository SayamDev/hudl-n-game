import { useEffect, useState } from "react";
export function PrivateMessage({ message }: { message: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const hide = () => setVisible(false);
    window.addEventListener("blur", hide);
    window.addEventListener("pointerup", hide);
    document.addEventListener("visibilitychange", hide);
    return () => {
      window.removeEventListener("blur", hide);
      window.removeEventListener("pointerup", hide);
      document.removeEventListener("visibilitychange", hide);
    };
  }, []);
  return (
    <>
      <p className="secret-result">
        {visible ? message : "Your finding is hidden."}
      </p>
      <button
        className="button primary hold-button"
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          setVisible(true);
        }}
        onPointerUp={() => setVisible(false)}
        onPointerCancel={() => setVisible(false)}
        onLostPointerCapture={() => setVisible(false)}
        onBlur={() => setVisible(false)}
        onContextMenu={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            setVisible(true);
          }
        }}
        onKeyUp={() => setVisible(false)}
      >
        Hold to see finding
      </button>
    </>
  );
}
