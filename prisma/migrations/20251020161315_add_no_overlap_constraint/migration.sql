-- Estensione per GiST (ok se già presente)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Indice per performance (ok se già presente)
CREATE INDEX IF NOT EXISTS bookingtable_timerange_gist
  ON "BookingTable" USING GIST (
    "tableId",
    tstzrange("start_at","end_at",'[]')
  );

-- Vincolo di esclusione (⚠️ senza NOT VALID)
ALTER TABLE "BookingTable"
  ADD CONSTRAINT bookingtable_no_overlap
  EXCLUDE USING GIST (
    "tableId" WITH =,
    tstzrange("start_at","end_at",'[]') WITH &&
  );
