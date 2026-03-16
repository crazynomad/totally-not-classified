"use client";

interface StampBadgeProps {
  text: string;
  size?: number;
}

export default function StampBadge({ text, size = 100 }: StampBadgeProps) {
  return (
    <div
      className="stamp animate-stamp-in"
      style={{ width: size, height: size, fontSize: size * 0.14 }}
    >
      {text}
    </div>
  );
}
