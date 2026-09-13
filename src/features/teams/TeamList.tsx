"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import {
  selectTeamsView,
  teamsViewChanged,
  type TeamsView,
} from "@/features/preferences/preferencesSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { DeleteTeamModal } from "./DeleteTeamModal";
import { TeamCard } from "./TeamCard";
import { TeamFormModal } from "./TeamFormModal";
import { selectAllTeams, type Team } from "./teamsSlice";

const PAGE_SIZE = 12;
const VIEWS: TeamsView[] = ["grid", "list"];

type ModalState = { type: "create" } | { type: "edit" | "delete"; team: Team } | null;

export function TeamList() {
  const teams = useAppSelector(selectAllTeams);
  const view = useAppSelector(selectTeamsView);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [modal, setModal] = useState<ModalState>(null);
  const [filter, setFilter] = useState("");

  const query = filter.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      query
        ? teams.filter((team) =>
            [team.name, team.region, team.country].some((value) =>
              value.toLowerCase().includes(query),
            ),
          )
        : teams,
    [teams, query],
  );

  // The page lives in the URL so a reload or the back button keeps it; it is
  // clamped so deleting the last team on a page never strands the user.
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const requestedPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const page = Math.min(requestedPage, pageCount);
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = useCallback(
    (next: number) =>
      router.replace(next === 1 ? pathname : `${pathname}?page=${next}`, { scroll: false }),
    [router, pathname],
  );

  useEffect(() => {
    if (requestedPage !== page) goToPage(page);
  }, [requestedPage, page, goToPage]);

  const openEdit = useCallback((team: Team) => setModal({ type: "edit", team }), []);
  const openDelete = useCallback((team: Team) => setModal({ type: "delete", team }), []);
  const close = () => setModal(null);

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Teams</h1>
        <Button onClick={() => setModal({ type: "create" })}>New team</Button>
      </div>

      {teams.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
          <p className="font-medium text-gray-900">No teams yet</p>
          <p className="mt-1 text-sm text-gray-600">
            Create your first team and pick its players, or add players later from the Players page.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <SearchInput
              aria-label="Filter teams"
              placeholder="Filter by name, region or country…"
              value={filter}
              onChange={(event) => {
                setFilter(event.target.value);
                if (page !== 1) goToPage(1);
              }}
              className="min-w-56 flex-1"
            />
            <div
              role="group"
              aria-label="View"
              className="inline-flex rounded-md border border-gray-300 bg-white p-0.5"
            >
              {VIEWS.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={view === option}
                  onClick={() => dispatch(teamsViewChanged(option))}
                  className={`rounded px-2.5 py-1 text-sm font-medium capitalize ${
                    view === option
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500" role="status">
              {query
                ? `${filtered.length} of ${teams.length} match`
                : `${teams.length} ${teams.length === 1 ? "team" : "teams"}`}
            </p>
          </div>

          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-500">
              No teams match “{filter.trim()}”.
            </p>
          ) : (
            <ul className={view === "grid" ? "grid gap-4 sm:grid-cols-2" : "space-y-3"}>
              {visible.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  variant={view}
                  onEdit={openEdit}
                  onDelete={openDelete}
                />
              ))}
            </ul>
          )}

          {pageCount > 1 && (
            <nav
              aria-label="Pagination"
              className="mt-6 flex items-center justify-center gap-3 text-sm text-gray-600"
            >
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => goToPage(page - 1)}
              >
                Previous
              </Button>
              <span>
                Page {page} of {pageCount}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page === pageCount}
                onClick={() => goToPage(page + 1)}
              >
                Next
              </Button>
            </nav>
          )}
        </>
      )}

      {modal?.type === "create" && <TeamFormModal onClose={close} />}
      {modal?.type === "edit" && <TeamFormModal team={modal.team} onClose={close} />}
      {modal?.type === "delete" && <DeleteTeamModal team={modal.team} onClose={close} />}
    </>
  );
}
