import { useCallback } from "react";
import type { Player } from "@/features/players/types";
import { toastShown } from "@/features/toast/toastSlice";
import { useAppDispatch } from "@/lib/hooks";
import { playerRemoved, type Team } from "./teamsSlice";

// Removing a team's last player is refused with an explanation instead of a
// dead button: the team must keep at least one player or be deleted.
export function useRemovePlayer() {
  const dispatch = useAppDispatch();

  return useCallback(
    (team: Team, player: Player) => {
      if (team.players.length <= 1) {
        dispatch(toastShown(`${team.name} needs at least one player — delete the team instead.`));
        return;
      }
      dispatch(playerRemoved({ teamId: team.id, playerId: player.id }));
    },
    [dispatch],
  );
}
