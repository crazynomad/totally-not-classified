"use client";

import { useRef, useCallback, useEffect } from "react";

interface ParamControlProps {
  label: string;
  sublabel?: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}

export default function ParamControl({
  label, sublabel, value, onChange, min, max, step,
}: ParamControlProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countRef = useRef(0);
  const valueRef = useRef(value);
  valueRef.current = value;

  const clamp = useCallback((v: number) => {
    const precision = step < 1 ? String(step).split(".")[1]?.length || 0 : 0;
    const clamped = Math.min(max, Math.max(min, v));
    return precision > 0 ? parseFloat(clamped.toFixed(precision)) : clamped;
  }, [min, max, step]);

  const stopRepeating = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    intervalRef.current = null;
    timeoutRef.current = null;
    countRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => stopRepeating, [stopRepeating]);

  const startRepeating = useCallback((direction: 1 | -1) => {
    // Immediate first step
    onChange(clamp(valueRef.current + step * direction));
    countRef.current = 1;

    // After 400ms hold, start repeating with acceleration
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        countRef.current++;
        // Accelerate: after 8 ticks x3, after 20 ticks x8
        const multiplier = countRef.current > 20 ? 8 : countRef.current > 8 ? 3 : 1;
        const newVal = clamp(valueRef.current + step * direction * multiplier);
        onChange(newVal);
      }, 80);
    }, 400);
  }, [step, clamp, onChange]);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-typewriter text-[11px] tracking-wider uppercase text-ink-light">
        {label}
      </label>
      <div className="flex items-center gap-0">
        <button
          className="stepper-btn"
          onPointerDown={() => startRepeating(-1)}
          onPointerUp={stopRepeating}
          onPointerLeave={stopRepeating}
          tabIndex={-1}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(clamp(Number(e.target.value)))}
          min={min}
          max={max}
          step={step}
        />
        <button
          className="stepper-btn"
          onPointerDown={() => startRepeating(1)}
          onPointerUp={stopRepeating}
          onPointerLeave={stopRepeating}
          tabIndex={-1}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
      {sublabel && (
        <span className="text-[10px] text-ink-gray font-mono">{sublabel}</span>
      )}
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
}
