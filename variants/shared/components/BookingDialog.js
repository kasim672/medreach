"use client";

import { useEffect, useRef } from "react";

const focusable = "a[href], button:not(:disabled), input:not(:disabled):not([type=hidden]), select:not(:disabled), textarea:not(:disabled), [tabindex='0']";

function visibleControls(dialog) {
  return [...dialog.querySelectorAll(focusable)].filter((element) =>
    element.tabIndex >= 0 && element.checkVisibility({ visibilityProperty: true }));
}

export default function BookingDialog({ className, style, labelledBy, busy, onClose, children }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const opener = document.activeElement;
    dialog.showModal();
    visibleControls(dialog)[0]?.focus();
    return () => {
      dialog.close();
      if (opener instanceof window.HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);

  function wrapFocus(event) {
    if (event.key !== "Tab") return;
    const fields = visibleControls(event.currentTarget);
    const index = fields.indexOf(document.activeElement);
    if (index === -1 || (event.shiftKey ? index === 0 : index === fields.length - 1)) {
      event.preventDefault();
      const next = event.shiftKey ? fields.at(-1) : fields[0];
      next?.focus();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={className}
      style={{ margin: 0, width: "100%", height: "100%", maxWidth: "none", maxHeight: "none", border: 0, color: "inherit", ...style }}
      aria-labelledby={labelledBy}
      aria-busy={busy}
      onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}
      onKeyDown={wrapFocus}
    >
      {children}
    </dialog>
  );
}
