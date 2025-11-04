// lib/tablePicker.ts
type TableLite = { id: string; capacity: number; mergeGroup?: string | null };
type Best = { ids: string[]; total: number };

export function pickTables(
  candidates: TableLite[],
  partySize: number
): string[] | null {
  // ordina per capacità crescente per sprecare meno coperti
  const tables = [...candidates].sort((a, b) => a.capacity - b.capacity);

  // 1) fast-path: singolo tavolo che basta
  const single = tables.find((t) => t.capacity >= partySize);
  if (single) return [single.id];

  // 2) raggruppa per mergeGroup (solo stessi group si possono unire)
  const byGroup = new Map<string, TableLite[]>();
  for (const t of tables) {
    if (!t.mergeGroup) continue;
    const arr = byGroup.get(t.mergeGroup) || [];
    arr.push(t);
    byGroup.set(t.mergeGroup, arr);
  }

  // usare una "box" così TS capisce che può cambiare in una closure
  const state: { best: Best | null } = { best: null };

  for (const group of byGroup.values()) {
    group.sort((a, b) => a.capacity - b.capacity);

    // limitiamo la ricerca combinatoria
    const MAX_IN_GROUP = 6;     // massimo tavoli considerati per gruppo
    const MAX_TABLES_MERGED = 4; // massimo tavoli combinabili
    const items = group.slice(0, MAX_IN_GROUP);

    function dfs(idx: number, sum: number, ids: string[]) {
      if (sum >= partySize) {
        if (!state.best || sum < state.best.total) {
          state.best = { ids: [...ids], total: sum };
        }
        return;
      }
      if (idx >= items.length) return;
      if (ids.length >= MAX_TABLES_MERGED) return;

      // pruning semplice: se abbiamo già una soluzione migliore, evita rami peggiori
      if (state.best && sum >= state.best.total) return;

      // scegli l'elemento corrente
      dfs(idx + 1, sum + items[idx].capacity, [...ids, items[idx].id]);
      // salta l'elemento corrente
      dfs(idx + 1, sum, ids);
    }

    // avvia DFS (abbiamo già controllato il caso "single")
    dfs(0, 0, []);
  }

  return state.best ? state.best.ids : null;
}
