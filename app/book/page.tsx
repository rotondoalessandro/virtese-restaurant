"use client";

import { useEffect, useMemo, useState } from "react";
import HoldModal from "./HoldModal";

type Slot = { time: string; available: number; suggestedArea?: string };

const AREAS = [
  { value: "", label: "No preference" },
  { value: "INDOOR", label: "Indoor" },
  { value: "OUTDOOR", label: "Outdoor" },
  { value: "BAR", label: "Bar" },
  { value: "HIGHTOP", label: "High-top" },
  { value: "PRIVATE", label: "Private" },
];

export default function BookPage() {
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [party, setParty] = useState<number>(2);
  const [area, setArea] = useState<string>("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [pickedTime, setPickedTime] = useState<string | null>(null);

  // customer fields (ora usati nel modal)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  // waitlist
  const [showWaitlist, setShowWaitlist] = useState(false);

  // hold state
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [holdAreaUsed, setHoldAreaUsed] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const hasForm = !!pickedTime;
  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const anyAvailable = slots.some((s) => s.available > 0);

  // fetch slots
  useEffect(() => {
    const params = new URLSearchParams({ date, party: String(party) });
    if (area) params.set("area", area);
    fetch(`/api/availability?${params.toString()}`)
      .then((r) => r.json())
      .then(({ slots }) => setSlots(slots))
      .catch(() => setSlots([]));
  }, [date, party, area]);

  // countdown
  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(diff);
      if (diff <= 0) {
        clearInterval(id);
        // scaduto → chiudi modal e pulisci
        releaseHold(true);
      }
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt]);

  // se cambia date/party/area mentre c'è un hold → annulla subito
  useEffect(() => {
    if (bookingId) releaseHold();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, party, area]);

  function clearHoldState() {
    setBookingId(null);
    setExpiresAt(null);
    setHoldAreaUsed(null);
    setSecondsLeft(0);
    setIsHolding(false);
    setIsConfirming(false);
    setModalOpen(false);
  }

  async function releaseHold(silent?: boolean) {
    try {
      if (bookingId) {
        await fetch("/api/hold/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        });
      }
    } catch {
      // ignore
    } finally {
      clearHoldState();
      if (!silent) {
        // opzionale: toast
      }
    }
  }

  // CLICK SULLO SLOT → HOLD immediato + modal con form cliente
  async function clickSlot(time: string) {
    if (isHolding) return;
    setPickedTime(time);

    // se c'è un hold precedente → rilascia prima
    if (bookingId) await releaseHold(true);

    setIsHolding(true);
    const dateTime = new Date(`${date}T${time}:00`).toISOString();

    const attemptHold = async (forcedArea?: string) => {
      const res = await fetch("/api/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateTime,
          partySize: party,
          area: forcedArea || (area || undefined),
        }),
      });
      return res;
    };

    let resHold = await attemptHold();

    // fallback area (se preferita fallisce)
    if (!resHold.ok && area) {
      try {
        const params = new URLSearchParams({ date, party: String(party) });
        const avail = await fetch(`/api/availability?${params.toString()}`).then((r) => r.json());
        const slot = (avail?.slots as Slot[] | undefined)?.find((s) => s.time === time);
        if (slot?.available && slot.suggestedArea && slot.suggestedArea !== area) {
          const yes = window.confirm(
            `No availability in ${area} at ${time}. We can seat you in ${slot.suggestedArea}. Do you want to proceed?`
          );
          if (yes) {
            resHold = await attemptHold(slot.suggestedArea);
            if (resHold.ok) setHoldAreaUsed(slot.suggestedArea);
          }
        }
      } catch {
        /* ignore */
      }
    }

    if (!resHold.ok) {
      setIsHolding(false);
      const { error } = await resHold.json().catch(() => ({ error: "Hold failed" }));
      const join = window.confirm(
        (error || "No availability at this time.") + "\nJoin the waitlist for this date?"
      );
      if (join) setShowWaitlist(true);
      return;
    }

    const json = await resHold.json();
    setBookingId(json.bookingId as string);
    setExpiresAt(json.expiresAt as string);
    if (!holdAreaUsed)
      setHoldAreaUsed(area || slots.find((s) => s.time === time)?.suggestedArea || null);

    setIsHolding(false);
    setModalOpen(true);
  }

  // conferma (dal modal) → POST /api/book
  async function confirmBooking() {
    if (!bookingId || isConfirming) return;
    setIsConfirming(true);

    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, name, email, phone, notes }),
    });

    if (!res.ok) {
      setIsConfirming(false);
      const { error } = await res.json().catch(() => ({ error: "Booking failed" }));
      alert(error || "Booking failed");
      return;
    }

    alert("Reservation confirmed! Check your email for details.");

    // reset UI
    setPickedTime(null);
    setName("");
    setEmail("");
    setPhone("");
    setNotes("");
    clearHoldState();

    // refresh availability
    const params = new URLSearchParams({ date, party: String(party) });
    if (area) params.set("area", area);
    fetch(`/api/availability?${params.toString()}`)
      .then((r) => r.json())
      .then(({ slots }) => setSlots(slots))
      .catch(() => {});
  }

  const mm = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const ss = Math.floor(secondsLeft % 60).toString().padStart(2, "0");

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-50">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6 lg:px-0">
        <header className="max-w-2xl">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-zinc-500">
            Reservations
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl">
            Reserve a table
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">
            Choose a date, time and where you’d like to sit. We’ll hold your table for a short
            time while you confirm your details.
          </p>
        </header>

        {/* Filters */}
        <div className="mt-8 grid gap-4 rounded-2xl border border-zinc-800 bg-black/40 p-4 sm:flex sm:flex-wrap sm:items-end sm:gap-5 sm:p-5">
          <label className="grid text-sm gap-1">
            <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">Date</span>
            <input
              type="date"
              value={date}
              min={minDate}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-400"
            />
          </label>

          <label className="grid text-sm gap-1">
            <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">Party</span>
            <input
              type="number"
              min={1}
              max={12}
              value={party}
              onChange={(e) => setParty(parseInt(e.target.value || "1"))}
              className="w-24 rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-400"
            />
          </label>

          <label className="grid text-sm gap-1 sm:min-w-[220px]">
            <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">
              Seating preference
            </span>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-400"
            >
              {AREAS.map((opt) => (
                <option key={opt.value || "any"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Slots */}
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Available times
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {slots.map((s) => (
              <button
                key={s.time}
                disabled={s.available === 0 || isHolding}
                onClick={() => clickSlot(s.time)}
                className={`flex flex-col items-center justify-center rounded-xl border px-3 py-2 text-sm transition
                  ${
                    s.available
                      ? "border-zinc-700 bg-zinc-900/60 hover:border-amber-400 hover:bg-zinc-900 cursor-pointer"
                      : "border-zinc-800 bg-zinc-900/40 opacity-40 cursor-not-allowed"
                  }
                  ${
                    pickedTime === s.time
                      ? "border-amber-400 bg-zinc-900 ring-2 ring-amber-400/40"
                      : ""
                  }`}
              >
                <span className="text-zinc-50">{s.time}</span>
                {!area && s.suggestedArea ? (
                  <span className="mt-1 rounded-full bg-zinc-950/80 px-2 py-[2px] text-[0.6rem] uppercase tracking-[0.16em] text-zinc-400 border border-zinc-700">
                    {s.suggestedArea}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </section>

        {/* suggerimento waitlist */}
        {!anyAvailable && !hasForm && (
          <div className="mt-8 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
            <p className="font-semibold text-[0.9rem]">
              No availability for this day.
            </p>
            <p className="mt-1 text-[0.8rem] text-amber-100/90">
              You can join the waitlist and we&apos;ll email you if a table opens up.
            </p>
          </div>
        )}

        {/* Waitlist form */}
        {(!anyAvailable || showWaitlist) && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const res = await fetch("/api/waitlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  dateISO: date,
                  partySize: party,
                  area: area || undefined,
                  name,
                  email,
                  phone,
                  notes,
                }),
              });
              if (res.ok) {
                alert("You're on the waitlist. We'll email you if a table opens up.");
                setShowWaitlist(false);
                setPickedTime(null);
              } else {
                const { error } = await res.json().catch(() => ({ error: "Error" }));
                alert(error || "Failed to join waitlist");
              }
            }}
            className="mt-10 max-w-xl rounded-2xl border border-zinc-800 bg-black/50 p-5 space-y-3"
          >
            <div className="text-sm text-zinc-200">
              <span className="font-semibold">Join the waitlist</span> for{" "}
              <span className="font-mono">{date}</span> • {party} guests{" "}
              {area ? (
                <>
                  • <span className="font-semibold">{area}</span>
                </>
              ) : null}
            </div>

            <label className="grid text-sm gap-1">
              <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">Name</span>
              <input
                className="rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>

            <label className="grid text-sm gap-1">
              <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">Email</span>
              <input
                type="email"
                className="rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="grid text-sm gap-1">
              <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                Phone (optional)
              </span>
              <input
                className="rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-400"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>

            <label className="grid text-sm gap-1">
              <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                Notes (optional)
              </span>
              <textarea
                rows={3}
                className="rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-400"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                className="rounded-full bg-amber-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-amber-400"
              >
                Join waitlist
              </button>
              <button
                type="button"
                className="rounded-full border border-zinc-700 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-100 transition hover:border-amber-400 hover:text-amber-200"
                onClick={() => setShowWaitlist(false)}
              >
                Cancel
              </button>
            </div>

            <p className="text-[0.7rem] text-zinc-500">
              We’ll email you if a table opens up on this date.
            </p>
          </form>
        )}

        {/* MODAL con form cliente + countdown */}
        <HoldModal
          open={modalOpen && !!bookingId && !!expiresAt}
          onClose={releaseHold}
          onConfirm={confirmBooking}
          mm={mm}
          ss={ss}
          date={date}
          time={pickedTime || ""}
          party={party}
          areaLabel={holdAreaUsed}
          isConfirming={isConfirming}
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          phone={phone}
          setPhone={setPhone}
          notes={notes}
          setNotes={setNotes}
        />
      </div>
    </main>
  );
}
