"use client";

import { useEffect, useMemo, useState } from "react";
import HoldModal from "./HoldModal";

import {
  addMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameDay,
  isBefore,
} from "date-fns";
import { it } from "date-fns/locale";

type Slot = { time: string; available: number; suggestedArea?: string };

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function Calendar({
  value,
  onChange,
  minDate,
}: {
  value: string;
  onChange: (newValue: string) => void;
  minDate: string;
}) {
  const [currentMonth, setCurrentMonth] = useState<Date>(() =>
    value ? new Date(value + "T00:00:00") : new Date()
  );

  const selectedDate = value ? new Date(value + "T00:00:00") : null;
  const min = new Date(minDate + "T00:00:00");
  const today = new Date();

  const monthLabel = format(currentMonth, "MMMM yyyy", { locale: it });

  // settimana che inizia di lunedì
  const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });

  const weeks: Date[][] = [];
  let day = start;

  while (day <= end) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    weeks.push(week);
  }

  const canGoPrev =
    currentMonth.getFullYear() > min.getFullYear() ||
    (currentMonth.getFullYear() === min.getFullYear() &&
      currentMonth.getMonth() > min.getMonth());

  const handleSelect = (d: Date) => {
    if (isBefore(d, min)) return;
    onChange(format(d, "yyyy-MM-dd"));
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 shadow-lg">
      {/* Header mese */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => canGoPrev && setCurrentMonth(addMonths(currentMonth, -1))}
          disabled={!canGoPrev}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700/80 text-xs text-zinc-300 transition hover:border-amber-400 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ‹
        </button>
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-200">
          {monthLabel}
        </div>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700/80 text-xs text-zinc-300 transition hover:border-amber-400 hover:text-amber-200"
        >
          ›
        </button>
      </div>

      {/* Giorni della settimana */}
      <div className="mb-1 grid grid-cols-7 text-center text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-zinc-500">
        <span>Lu</span>
        <span>Ma</span>
        <span>Me</span>
        <span>Gi</span>
        <span>Ve</span>
        <span>Sa</span>
        <span>Do</span>
      </div>

      {/* Giorni */}
      <div className="grid grid-cols-7 gap-1.5 text-sm">
        {weeks.map((week, wi) =>
          week.map((d, di) => {
            const isDisabled = isBefore(d, min);
            const isSelected = !!selectedDate && isSameDay(d, selectedDate);
            const isToday = isSameDay(d, today);
            const inCurrentMonth = d.getMonth() === currentMonth.getMonth();

            const base =
              "flex h-9 w-9 items-center justify-center rounded-full border text-xs transition-colors duration-150 focus-visible:outline-none";

            let style = "";

            if (isSelected) {
              // 🔥 selezionato = pieno arancione SEMPRE
              style =
                "border-amber-400 bg-amber-400 text-black shadow-[0_0_0_1px_rgba(251,191,36,0.4)] hover:bg-amber-400 hover:border-amber-400";
            } else if (isDisabled) {
              style = "border-zinc-800 bg-zinc-950 text-zinc-600 opacity-30 cursor-not-allowed";
            } else {
              style = inCurrentMonth
                ? "border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-amber-400 hover:bg-amber-500/20 hover:text-amber-100"
                : "border-zinc-900 bg-zinc-950 text-zinc-600";

              // giorno di oggi (solo se non selezionato)
              if (isToday) {
                style += " ring-1 ring-amber-400/60";
              }
            }

            return (
              <button
                key={`${wi}-${di}`}
                type="button"
                disabled={isDisabled}
                onClick={() => handleSelect(d)}
                className={`${base} ${style}`}
              >
                {d.getDate()}
              </button>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-3 text-[0.7rem] text-zinc-500">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex h-3 w-3 rounded-full border border-amber-400 bg-amber-400" />
          <span>Data selezionata</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex h-3 w-3 rounded-full border border-zinc-600" />
          <span>Disponibile</span>
        </div>
      </div>
    </div>
  );
}

export default function BookPage() {
  const [step, setStep] = useState<Step>(1);

  // dati cliente
  const [name, setName] = useState("");       // nome
  const [surname, setSurname] = useState(""); // cognome
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const displayName = useMemo(
    () => [name, surname].filter(Boolean).join(" "),
    [name, surname]
  );

  // consensi
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [consentProfiling, setConsentProfiling] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentAll, setConsentAll] = useState(false);

  // prenotazione
  const [party, setParty] = useState<number>(2);
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );

  // availability
  const [slots, setSlots] = useState<Slot[]>([]);
  const [pickedTime, setPickedTime] = useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);

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

  const minDate = useMemo(
    () => new Date().toISOString().slice(0, 10),
    []
  );

  const hasForm = !!pickedTime;
  const anyAvailable = !isLoadingSlots && slots.some((s) => s.available > 0);

  // fetch slots SOLO allo step 7
  useEffect(() => {
    if (step !== 7) return;

    let cancelled = false;

    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      setSlots([]);
      setPickedTime(null);

      const params = new URLSearchParams({
        date,
        party: String(party),
      });

      try {
        const res = await fetch(`/api/availability?${params.toString()}`);
        const data = await res.json();
        if (!cancelled) {
          setSlots((data?.slots as Slot[]) || []);
        }
      } catch {
        if (!cancelled) {
          setSlots([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSlots(false);
        }
      }
    };

    fetchSlots();

    return () => {
      cancelled = true;
    };
  }, [step, date, party]);

  // countdown hold
  useEffect(() => {
    if (!expiresAt) return;

    const id = setInterval(() => {
      const diff = Math.max(
        0,
        Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
      );
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

  // se cambia date/party mentre c'è un hold → annulla
  useEffect(() => {
    if (bookingId) releaseHold();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, party]);

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

  // CLICK SULLO SLOT → HOLD + modal (solo note)
  async function clickSlot(time: string) {
    if (isHolding || isLoadingSlots) return;
    setPickedTime(time);

    // se c'è un hold precedente → rilascia prima
    if (bookingId) await releaseHold(true);

    setIsHolding(true);
    const dateTime = new Date(`${date}T${time}:00`).toISOString();

    const resHold = await fetch("/api/hold", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dateTime,
        partySize: party,
      }),
    });

    if (!resHold.ok) {
      setIsHolding(false);
      const { error } = await resHold.json().catch(() => ({ error: "Hold failed" }));
      const join = window.confirm(
        (error || "No availability at this time.") +
          "\nJoin the waitlist for this date?"
      );
      if (join) setShowWaitlist(true);
      return;
    }

    const json = await resHold.json();
    setBookingId(json.bookingId as string);
    setExpiresAt(json.expiresAt as string);
    setHoldAreaUsed(
      json.area || slots.find((s) => s.time === time)?.suggestedArea || null
    );

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
      body: JSON.stringify({
        bookingId,
        name,
        surname,
        email,
        phone,
        notes,
        consent: {
          marketing: consentMarketing,
          profiling: consentProfiling,
          privacy: consentPrivacy,
        },
      }),
    });

    if (!res.ok) {
      setIsConfirming(false);
      const { error } = await res.json().catch(() => ({ error: "Booking failed" }));
      alert(error || "Booking failed");
      return;
    }

    alert("Reservation confirmed! Check your email for details.");

    // reset UI minima
    setPickedTime(null);
    clearHoldState();

    // refresh availability se siamo ancora allo step 7
    if (step === 7) {
      try {
        setIsLoadingSlots(true);
        setSlots([]);
        const params = new URLSearchParams({
          date,
          party: String(party),
        });
        const r = await fetch(`/api/availability?${params.toString()}`);
        const { slots } = await r.json();
        setSlots(slots || []);
      } catch {
        setSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    }
  }

  const mm = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor(secondsLeft % 60)
    .toString()
    .padStart(2, "0");

  // stepper labels
  const stepLabel = (s: Step) => {
    switch (s) {
      case 1:
        return "Nome e cognome";
      case 2:
        return "Telefono";
      case 3:
        return "Email";
      case 4:
        return "Termini";
      case 5:
        return "Persone";
      case 6:
        return "Data";
      case 7:
        return "Orario";
    }
  };

  const steps: Step[] = [1, 2, 3, 4, 5, 6, 7];

  // validazione per il tasto "Continua"
  function canGoNext(current: Step): boolean {
    switch (current) {
      case 1:
        return name.trim().length > 0 && surname.trim().length > 0;
      case 2:
        return phone.trim().length > 0;
      case 3:
        return isValidEmail(email);
      case 4:
        return consentPrivacy; // obbligatorio
      case 5:
        return party > 0;
      case 6:
        return !!date;
      default:
        return true;
    }
  }

  function goNext() {
    if (!canGoNext(step)) return;
    if (step < 7) setStep((s) => (s + 1) as Step);
  }

  function goBack() {
    if (step > 1) setStep((s) => (s - 1) as Step);
  }

  function handleToggleAll(checked: boolean) {
    setConsentAll(checked);
    setConsentMarketing(checked);
    setConsentProfiling(checked);
    setConsentPrivacy(checked);
  }

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-50">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6 lg:px-0">
        <header className="max-w-2xl">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-zinc-500">
            Reservations
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl">Reserve a table</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">
            We&apos;ll guide you through a few quick steps to book your table. Your
            selection will be held briefly while you confirm.
          </p>
        </header>

        {/* Stepper con pallini cliccabili (indietro) */}
        <div className="mt-6 flex flex-wrap items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          {steps.map((s, idx) => {
            const isCurrent = step === s;
            const isCompleted = s < step;
            return (
              <div key={s} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={
                    isCompleted
                      ? () => setStep(s)
                      : undefined
                  }
                  className="focus-visible:outline-none"
                >
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-[0.7rem] transition
                      ${
                        isCurrent
                          ? "border-amber-400 bg-amber-400 text-black"
                          : isCompleted
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                          : "border-zinc-700 bg-zinc-900 text-zinc-400"
                      }`}
                  >
                    {isCompleted ? "✓" : s}
                  </div>
                </button>
                <span className="hidden text-[0.65rem] text-zinc-400 sm:inline">
                  {stepLabel(s)}
                </span>
                {idx < steps.length - 1 && (
                  <div className="hidden h-px w-6 bg-zinc-700/70 sm:block" />
                )}
              </div>
            );
          })}
        </div>

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-black/40 p-5 sm:p-6">
          {/* STEP 1 – Nome e cognome */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  Step 1 · Nome e cognome
                </h2>
                <p className="mt-2 text-sm text-zinc-300">
                  Inizia lasciandoci il tuo nome e cognome per la prenotazione.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 sm:max-w-xl">
                <label className="grid gap-1 text-sm">
                  <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                    Nome
                  </span>
                  <input
                    className="rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-400"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Es. Mario"
                  />
                </label>

                <label className="grid gap-1 text-sm">
                  <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                    Cognome
                  </span>
                  <input
                    className="rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-400"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="Es. Rossi"
                  />
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canGoNext(1)}
                  className="rounded-full bg-amber-500 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continua
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 – Telefono */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  Step 2 · Numero di telefono
                </h2>
                <p className="mt-2 text-sm text-zinc-300">
                  Inserisci un numero di telefono per eventuali comunicazioni sulla
                  prenotazione.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-black/40 p-4 text-sm text-zinc-300">
                <p>
                  <span className="font-semibold">Nome:</span>{" "}
                  <span className="font-mono text-zinc-100">{displayName || "—"}</span>
                </p>
              </div>

              <label className="grid gap-1 text-sm sm:max-w-xs">
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                  Telefono
                </span>
                <input
                  type="tel"
                  className="rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-400"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only digits and '+' at the beginning
                    if (/^[+0-9]*$/.test(value)) {
                      setPhone(value);
                    }
                  }}
                  placeholder="+39 ..."
                />
              </label>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-full border border-zinc-700 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-100 transition hover:border-amber-400 hover:text-amber-200"
                >
                  Indietro
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canGoNext(2)}
                  className="rounded-full bg-amber-500 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continua
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 – Email */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  Step 3 · Email
                </h2>
                <p className="mt-2 text-sm text-zinc-300">
                  Useremo questa email per inviarti conferma e dettagli della prenotazione.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-black/40 p-4 text-sm text-zinc-300">
                <p>
                  <span className="font-semibold">Nome:</span>{" "}
                  <span className="font-mono text-zinc-100">{displayName || "—"}</span>
                </p>
                <p className="mt-1">
                  <span className="font-semibold">Telefono:</span>{" "}
                  <span className="font-mono text-zinc-100">{phone || "—"}</span>
                </p>
              </div>

              <label className="grid gap-1 text-sm sm:max-w-md">
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                  Email
                </span>
                <input
                  type="email"
                  className="rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="esempio@email.com"
                />
                {email && !isValidEmail(email) && (
                  <span className="mt-1 text-[0.75rem] text-red-400">
                    Inserisci un indirizzo email valido.
                  </span>
                )}
              </label>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-full border border-zinc-700 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-100 transition hover:border-amber-400 hover:text-amber-200"
                >
                  Indietro
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canGoNext(3)}
                  className="rounded-full bg-amber-500 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continua
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 – Termini e condizioni */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  Step 4 · Termini e condizioni
                </h2>
                <p className="mt-2 text-sm text-zinc-300">
                  Gestisci i consensi per il trattamento dei tuoi dati personali.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-black/40 p-4 text-sm text-zinc-300 space-y-1">
                <p>
                  <span className="font-semibold">Nome:</span>{" "}
                  <span className="font-mono text-zinc-100">{displayName || "—"}</span>
                </p>
                <p>
                  <span className="font-semibold">Telefono:</span>{" "}
                  <span className="font-mono text-zinc-100">{phone || "—"}</span>
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  <span className="font-mono text-zinc-100">{email || "—"}</span>
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  Termini e condizioni
                </p>
                <p className="text-[0.8rem] text-zinc-400">
                  Acconsento all&apos;utilizzo dei miei dati per:
                </p>

                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-[3px] h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-amber-500"
                    checked={consentMarketing}
                    onChange={(e) => setConsentMarketing(e.target.checked)}
                  />
                  <span>
                    Consenso marketing e comunicazioni{" "}
                    <span className="text-xs text-zinc-500">Dettaglio</span>
                  </span>
                </label>

                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-[3px] h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-amber-500"
                    checked={consentProfiling}
                    onChange={(e) => setConsentProfiling(e.target.checked)}
                  />
                  <span>
                    Consenso profilazione{" "}
                    <span className="text-xs text-zinc-500">Dettaglio</span>
                  </span>
                </label>

                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-[3px] h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-amber-500"
                    checked={consentPrivacy}
                    onChange={(e) => setConsentPrivacy(e.target.checked)}
                  />
                  <span>
                    Privacy e trattamento dati{" "}
                    <span className="text-red-400">*</span>{" "}
                    <span className="text-xs text-zinc-500">Dettaglio</span>
                  </span>
                </label>

                <label className="flex items-start gap-2 text-sm pt-1 border-t border-zinc-800 mt-2">
                  <input
                    type="checkbox"
                    className="mt-[3px] h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-amber-500"
                    checked={consentAll}
                    onChange={(e) => handleToggleAll(e.target.checked)}
                  />
                  <span>Autorizzo tutti i trattamenti</span>
                </label>

                {!consentPrivacy && (
                  <p className="text-[0.75rem] text-red-400">
                    Il consenso a privacy e trattamento dati è obbligatorio per proseguire.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-full border border-zinc-700 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-100 transition hover:border-amber-400 hover:text-amber-200"
                >
                  Indietro
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canGoNext(4)}
                  className="rounded-full bg-amber-500 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continua
                </button>
              </div>
            </div>
          )}

          {/* STEP 5 – Numero di persone */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  Step 5 · Numero di persone
                </h2>
                <p className="mt-2 text-sm text-zinc-300">
                  Quante persone saranno al tavolo?
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-black/40 p-4 text-sm text-zinc-300 space-y-1">
                <p>
                  <span className="font-semibold">Nome:</span>{" "}
                  <span className="font-mono text-zinc-100">{displayName || "—"}</span>
                </p>
                <p>
                  <span className="font-semibold">Telefono:</span>{" "}
                  <span className="font-mono text-zinc-100">{phone || "—"}</span>
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  <span className="font-mono text-zinc-100">{email || "—"}</span>
                </p>
              </div>

              <label className="grid gap-1 text-sm sm:max-w-xs">
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                  Numero di persone
                </span>
                <input
                  type="text"
                  inputMode="numeric" // tastierino numerico su mobile
                  className="rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-400"
                  value={party}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Solo cifre (0–9)
                    if (/^\d*$/.test(value)) {
                      const num = value === "" ? 0 : parseInt(value, 10);
                      // Limita tra 1 e 20 (o lascia vuoto)
                      if (num === 0 || (num >= 1 && num <= 20)) {
                        setParty(num);
                      }
                    }
                  }}
                  placeholder="Es. 2"
                />
              </label>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-full border border-zinc-700 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-100 transition hover:border-amber-400 hover:text-amber-200"
                >
                  Indietro
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canGoNext(5)}
                  className="rounded-full bg-amber-500 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continua
                </button>
              </div>
            </div>
          )}

          {/* STEP 6 – Data */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  Step 6 · Scegli la data
                </h2>
                <p className="mt-2 text-sm text-zinc-300">
                  Seleziona la data in cui desideri prenotare il tavolo.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-black/40 p-4 text-sm text-zinc-300 space-y-1">
                <p>
                  <span className="font-semibold">Ospiti:</span>{" "}
                  <span className="font-mono text-zinc-100">{party}</span>
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                  Data
                </p>
                <Calendar value={date} onChange={setDate} minDate={minDate} />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-full border border-zinc-700 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-100 transition hover:border-amber-400 hover:text-amber-200"
                >
                  Indietro
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canGoNext(6)}
                  className="rounded-full bg-amber-500 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Vedi orari disponibili
                </button>
              </div>
            </div>
          )}

          {/* STEP 7 – Orario + waitlist */}
          {step === 7 && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
                    Step 7 · Scegli l&apos;orario
                  </h2>
                  <p className="mt-2 text-sm text-zinc-300">
                    Seleziona uno degli orari disponibili. Il tavolo verrà tenuto in
                    sospeso mentre confermi la prenotazione.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-full border border-zinc-700 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-zinc-100 transition hover:border-amber-400 hover:text-amber-200"
                >
                  Modifica dettagli
                </button>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-black/40 p-4 text-sm text-zinc-300 space-y-1">
                <p>
                  <span className="font-semibold">Nome:</span>{" "}
                  <span className="font-mono text-zinc-100">{displayName || "—"}</span>
                </p>
                <p>
                  <span className="font-semibold">Ospiti:</span>{" "}
                  <span className="font-mono text-zinc-100">{party}</span>
                </p>
                <p>
                  <span className="font-semibold">Data:</span>{" "}
                  <span className="font-mono text-zinc-100">{date}</span>
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Orari disponibili
                </h3>

                {isLoadingSlots ? (
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 animate-pulse"
                      >
                        <div className="h-3 w-10 rounded bg-zinc-700" />
                        <div className="mt-2 h-3 w-14 rounded-full bg-zinc-800" />
                      </div>
                    ))}
                  </div>
                ) : slots.length > 0 ? (
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
                        {s.suggestedArea ? (
                          <span className="mt-1 rounded-full bg-zinc-950/80 px-2 py-[2px] text-[0.6rem] uppercase tracking-[0.16em] text-zinc-400 border border-zinc-700">
                            {s.suggestedArea}
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400">
                    Nessun orario disponibile per questa selezione. Prova un&apos;altra
                    data oppure un numero diverso di persone, oppure unisciti alla
                    waitlist.
                  </p>
                )}
              </div>

              {/* suggerimento waitlist */}
              {!isLoadingSlots && !anyAvailable && !hasForm && (
                <div className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
                  <p className="font-semibold text-[0.9rem]">
                    Nessuna disponibilità per questa data.
                  </p>
                  <p className="mt-1 text-[0.8rem] text-amber-100/90">
                    Puoi unirti alla waitlist e ti avviseremo via email se si libera un
                    tavolo.
                  </p>
                </div>
              )}

              {/* Waitlist form */}
              {step === 7 && (!anyAvailable || showWaitlist) && !isLoadingSlots && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const res = await fetch("/api/waitlist", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        dateISO: date,
                        partySize: party,
                        name: displayName || name,
                        email,
                        phone,
                        notes,
                      }),
                    });
                    if (res.ok) {
                      alert(
                        "Sei stato aggiunto alla waitlist. Ti manderemo una email se si libera un tavolo."
                      );
                      setShowWaitlist(false);
                      setPickedTime(null);
                    } else {
                      const { error } = await res
                        .json()
                        .catch(() => ({ error: "Error" }));
                      alert(error || "Impossibile aggiungerti alla waitlist");
                    }
                  }}
                  className="mt-6 max-w-xl space-y-3 rounded-2xl border border-zinc-800 bg-black/50 p-5"
                >
                  <div className="text-sm text-zinc-200">
                    <span className="font-semibold">Unisciti alla waitlist</span> per{" "}
                    <span className="font-mono">{date}</span> • {party} ospiti
                  </div>

                  <label className="grid gap-1 text-sm">
                    <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                      Note (opzionale)
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
                      Conferma waitlist
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-zinc-700 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-100 transition hover:border-amber-400 hover:text-amber-200"
                      onClick={() => setShowWaitlist(false)}
                    >
                      Annulla
                    </button>
                  </div>

                  <p className="text-[0.7rem] text-zinc-500">
                    Ti avviseremo via email se si libera un tavolo in questa data.
                  </p>
                </form>
              )}
            </div>
          )}
        </section>

        {/* MODAL con solo note + countdown */}
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
          notes={notes}
          setNotes={setNotes}
        />
      </div>
    </main>
  );
}
