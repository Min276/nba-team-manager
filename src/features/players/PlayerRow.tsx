import { memo } from "react";
import type { Player } from "./types";

// ponytail: content-visibility lets the browser skip laying out off-screen rows,
// which keeps scrolling smooth into the hundreds of rows without a
// virtualisation library. Beyond a few thousand rows, switch to windowing.
const rowClass =
  "flex items-center gap-4 px-4 py-3 [content-visibility:auto] [contain-intrinsic-size:auto_64px]";

export const PlayerRow = memo(function PlayerRow({ player }: { player: Player }) {
  return (
    <li className={rowClass}>
      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700"
      >
        {player.firstName[0]}
        {player.lastName[0]}
      </span>
      <div className="min-w-0">
        <p className="truncate font-medium text-gray-900">
          {player.firstName} {player.lastName}
        </p>
        <p className="truncate text-sm text-gray-500">
          {player.position || "N/A"} · {player.nbaTeam}
        </p>
      </div>
    </li>
  );
});
