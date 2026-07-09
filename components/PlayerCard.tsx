"use client";

import type { Player } from "@/lib/types";

const POS_COLOR: Record<string, string> = {
  GK: "from-amber-400 to-amber-600",
  DEF: "from-cyan-400 to-cyan-600",
  MID: "from-tether-light to-tether-dark",
  FWD: "from-violet-400 to-violet-600",
};

export function PlayerCard({
  player,
  selected,
  disabled,
  onToggle,
}: {
  player: Player;
  selected?: boolean;
  disabled?: boolean;
  onToggle?: (p: Player) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle?.(player)}
      disabled={disabled && !selected}
      className={`panel foil group relative w-full overflow-hidden p-3 text-left transition-all ${
        selected
          ? "ring-2 ring-tether-light shadow-glow-tether"
          : "hover:-translate-y-0.5"
      } ${disabled && !selected ? "opacity-40" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`rounded-md bg-gradient-to-b ${
            POS_COLOR[player.position]
          } px-2 py-0.5 text-[10px] font-bold text-midnight-900`}
        >
          {player.position}
        </span>
        <span className="font-display text-xs text-slate-400">
          {player.teamName}
        </span>
      </div>

      <div className="mt-3 font-display text-sm font-bold leading-tight text-white">
        {player.name}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="readout px-2 py-1">
          <span className="text-[10px] text-slate-400">PTS</span>{" "}
          <span className="font-display text-sm font-bold text-cyanglow">
            {player.points}
          </span>
        </div>
        <div className="readout px-2 py-1">
          <span className="text-[10px] text-slate-400">£</span>{" "}
          <span className="font-display text-sm font-bold text-gold">
            {player.price.toFixed(1)}
          </span>
        </div>
      </div>

      {selected && (
        <div className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-tether-light text-midnight-900 shadow-glow-tether">
          ✓
        </div>
      )}
    </button>
  );
}
