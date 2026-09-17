import type { DeskRepository } from "@leadpilot/core";

let activeRepo: DeskRepository | null = null;
const listeners = new Set<(repo: DeskRepository | null) => void>();

export function setActiveDeskRepository(repo: DeskRepository | null) {
  activeRepo = repo;
  listeners.forEach((fn) => fn(repo));
}

export function getActiveDeskRepository(): DeskRepository | null {
  return activeRepo;
}

export function onActiveDeskRepositoryChange(
  fn: (repo: DeskRepository | null) => void
): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Fire-and-forget persist helper — never blocks UI */
export function persistRepo(task: (repo: DeskRepository) => Promise<unknown>) {
  const repo = activeRepo;
  if (!repo || repo.backend !== "supabase") return;
  void task(repo).catch((err) => {
    console.error("[leadpilot] repo persist failed", err);
  });
}
