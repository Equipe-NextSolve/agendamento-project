"use client";

import { useState } from "react";

function toneClasses(tone) {
  if (tone === "danger") {
    return {
      trigger:
        "border border-red-500 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-500 hover:text-white",
      confirm:
        "bg-red-600 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60",
    };
  }

  return {
    trigger:
      "border border-greendark px-4 text-sm font-semibold text-greendark transition hover:bg-greendark hover:text-white",
    confirm:
      "bg-greendark text-white transition hover:bg-bluelight disabled:cursor-not-allowed disabled:opacity-60",
  };
}

export function ConfirmActionButton({
  cancelLabel = "Cancelar",
  confirmLabel = "Confirmar",
  description,
  disabled = false,
  isProcessing = false,
  onConfirm,
  title,
  tone = "danger",
  triggerLabel,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const classes = toneClasses(tone);

  const handleConfirm = async () => {
    await onConfirm?.();
    setIsOpen(false);
  };

  return (
    <>
      <button
        className={`inline-flex h-10 items-center justify-center rounded-lg cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${classes.trigger}`}
        disabled={disabled || isProcessing}
        type="button"
        onClick={() => setIsOpen(true)}
      >
        {isProcessing ? "Processando..." : triggerLabel}
      </button>

      {isOpen
        ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-bluedark/50 p-4">
            <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-bluedark">{title}</h3>
                <p className="text-sm text-bluelight">{description}</p>
              </div>

              <div className="flex w-full flex-col gap-3 md:flex-row">
                <button
                  className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center rounded-lg border border-bluelight/30 px-4 text-sm font-semibold text-bluedark transition hover:border-greendark hover:text-greendark"
                  type="button"
                  onClick={() => setIsOpen(false)}
                >
                  {cancelLabel}
                </button>
                <button
                  className={`inline-flex h-11 flex-1 cursor-pointer items-center justify-center rounded-lg px-4 text-sm font-semibold ${classes.confirm}`}
                  disabled={isProcessing}
                  type="button"
                  onClick={handleConfirm}
                >
                  {isProcessing ? "Confirmando..." : confirmLabel}
                </button>
              </div>
            </div>
          </div>
        : null}
    </>
  );
}
