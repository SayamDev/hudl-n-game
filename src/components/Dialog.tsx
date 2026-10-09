import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
export function Dialog({
  children,
  label,
  onClose,
  alert = false,
}: {
  children: ReactNode;
  label: string;
  onClose: () => void;
  alert?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const el = ref.current!;
    const focusable = () =>
      Array.from(
        el.querySelectorAll<HTMLElement>(
          'button:not(:disabled),[href],input:not(:disabled),select,textarea,summary,[tabindex="0"]',
        ),
      ).filter((n) => n.getClientRects().length > 0);
    focusable()[0]?.focus();
    const listener = (e: KeyboardEvent) => {
      const dialogs = document.querySelectorAll('[aria-modal="true"]');
      if (dialogs[dialogs.length - 1] !== el) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close.current();
      }
      if (e.key === "Tab") {
        const list = focusable(),
          first = list[0],
          last = list.at(-1);
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            !el.contains(document.activeElement))
        ) {
          e.preventDefault();
          last?.focus();
        } else if (
          !e.shiftKey &&
          (document.activeElement === last ||
            !el.contains(document.activeElement))
        ) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
      previous?.focus();
    };
  }, []);
  return (
    <section
      ref={ref}
      className="modal"
      role={alert ? "alertdialog" : "dialog"}
      aria-modal="true"
      aria-labelledby={label}
    >
      {children}
    </section>
  );
}
