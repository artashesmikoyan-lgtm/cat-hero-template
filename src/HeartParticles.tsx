import { useEffect, useState } from "react";

export type HeartItem = {
  id: number;
  x: number;
  y: number;
  size: number;
  emoji: string;
  rotation: number;
};

type Props = {
  hearts: HeartItem[];
};

export default function HeartParticles({ hearts }: Props) {
  return (
    <div className="hearts-container" aria-hidden="true">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="heart-particle"
          style={{
            left: h.x,
            top: h.y,
            fontSize: `${h.size}px`,
            transform: `translate(-50%, -50%) rotate(${h.rotation}deg)`,
          }}
        >
          {h.emoji}
        </span>
      ))}
    </div>
  );
}
