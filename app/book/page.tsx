"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

/* ---------------- CALENDAR ---------------- */

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

  // Map of YYYY-MM-DD -> { closed, openTime, closeTime }
  const [closedMap, setClosedMap] = useState<
    Record<string, { closed: boolean; openTime?: string; closeTime?: string }>
  >({});

  const monthLabel = format(currentMonth, "MMMM yyyy", { locale: it });

  // helper to format YYYY-MM-DD in local time
  const ymd = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${da}`;
  };

  // week starting on Monday
  const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
  const rangeFrom = ymd(start);
  const rangeTo = ymd(end);

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

  // Fetch open/closed info for the displayed range
  useEffect(() => {
    const from = rangeFrom;
    const to = rangeTo;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/opening/range?from=${from}&to=${to}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setClosedMap((data?.days as typeof closedMap) || {});
      } catch {
        if (!cancelled) setClosedMap({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rangeFrom, rangeTo]);

  const canGoPrev =
    currentMonth.getFullYear() > min.getFullYear() ||
    (currentMonth.getFullYear() === min.getFullYear() &&
      currentMonth.getMonth() > min.getMonth());

  const handleSelect = (d: Date) => {
    if (isBefore(d, min)) return;
    onChange(format(d, "yyyy-MM-dd"));
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl border border-[#e1d6c9] bg-white p-4 shadow-sm">
      {/* Month header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => canGoPrev && setCurrentMonth(addMonths(currentMonth, -1))}
          disabled={!canGoPrev}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e1d6c9] bg-[#f8f2ea] text-base text-[#5b4b41] transition hover:bg-[#e1d6c9] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="text-sm sm:text-base font-semibold uppercase tracking-[0.2em] text-[#5b4b41]">
          {monthLabel}
        </div>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e1d6c9] bg-[#f8f2ea] text-base text-[#5b4b41] transition hover:bg-[#e1d6c9]"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Weekdays */}
      <div className="mb-2 grid grid-cols-7 text-center text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#8a7463]">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1.5 text-sm">
        {weeks.map((week, wi) =>
          week.map((d, di) => {
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
              2,
              "0"
            )}-${String(d.getDate()).padStart(2, "0")}`;
            const closed = !!closedMap[key]?.closed;
            const minDisabled = isBefore(d, min);
            const isDisabled = minDisabled || closed;
            const isSelected = !!selectedDate && isSameDay(d, selectedDate);
            const isToday = isSameDay(d, today);
            const inCurrentMonth = d.getMonth() === currentMonth.getMonth();

            const base =
              "flex h-10 w-10 items-center justify-center rounded-full border text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b4b41]/70";

            let style = "";

            if (isSelected) {
              style =
                "border-[#5b4b41] bg-[#5b4b41] text-[#f5ede4] shadow-[0_0_0_1px_rgba(0,0,0,0.15)]";
            } else if (minDisabled) {
              style =
                "border-[#e1d6c9] bg-[#f8f2ea] text-[#c4b1a0] cursor-not-allowed";
            } else if (closed) {
              style =
                "border-[#f0b3b3] bg-[#fdeaea] text-[#b64848] cursor-not-allowed flex-col";
            } else {
              style = inCurrentMonth
                ? "border-[#e1d6c9] bg-white text-[#5b4b41] hover:bg-[#f8f2ea]"
                : "border-transparent bg-transparent text-[#c4b1a0]";
              if (isToday && !isSelected) {
                style += " ring-1 ring-[#beafa1]";
              }
            }

            return (
              <button
                key={`${wi}-${di}`}
                type="button"
                disabled={isDisabled}
                onClick={() => handleSelect(d)}
                title={
                  closed
                    ? "Closed"
                    : format(d, "dd MMMM yyyy", { locale: it })
                }
                className={`${base} ${style}`}
              >
                <span className="leading-none">{d.getDate()}</span>
                {closed ? (
                  <span className="mt-0.5 text-[8px] uppercase tracking-[0.18em]">
                    closed
                  </span>
                ) : null}
              </button>
            );
          })
        )}
      </div>

      {/* Opening info */}
      <div className="mt-3 text-xs text-center text-[#8a7463]">
        {selectedDate ? (
          (() => {
            const key = `${selectedDate.getFullYear()}-${String(
              selectedDate.getMonth() + 1
            ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(
              2,
              "0"
            )}`;
            const info = closedMap[key];
            if (!info) return null;
            if (info.closed) return <span>Closed</span>;
            if (info.openTime && info.closeTime)
              return (
                <span>
                  Open {info.openTime}–{info.closeTime}
                </span>
              );
            return null;
          })()
        ) : (
          <span>Select a date to see opening hours.</span>
        )}
      </div>
    </div>
  );
}

/* ---------------- MAIN BOOKING PAGE ---------------- */

export default function BookPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  // customer data
  const [name, setName] = useState(""); // first name
  const [surname, setSurname] = useState(""); // last name
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const displayName = useMemo(
    () => [name, surname].filter(Boolean).join(" "),
    [name, surname]
  );

  // consents
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [consentProfiling, setConsentProfiling] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentAll, setConsentAll] = useState(false);

  // booking
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

  // fetch slots ONLY at step 7
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

  // hold countdown
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
        // expired → close modal and clear
        releaseHold(true);
      }
    }, 1000);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt]);

  // if date/party changes while there's a hold → cancel
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
        // optional: toast
      }
    }
  }

  // CLICK ON SLOT → HOLD + modal (notes only)
  async function clickSlot(time: string) {
    if (isHolding || isLoadingSlots) return;
    setPickedTime(time);

    // if there was a previous hold → release first
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
      const { error } = await resHold
        .json()
        .catch(() => ({ error: "Hold failed" }));
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

  // confirm (from modal) → POST /api/book
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
      const { error } = await res
        .json()
        .catch(() => ({ error: "Booking failed" }));
      alert(error || "Booking failed");
      return;
    }

    // Clear local hold state and redirect to thank-you page
    setPickedTime(null);
    clearHoldState();
    setIsConfirming(false);
    router.push("/thank-you");
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
        return "Name";
      case 2:
        return "Phone";
      case 3:
        return "Email";
      case 4:
        return "Terms";
      case 5:
        return "Guests";
      case 6:
        return "Date";
      case 7:
        return "Time";
    }
  };

  const steps: Step[] = [1, 2, 3, 4, 5, 6, 7];

  // validation for the "Continue" button
  function canGoNext(current: Step): boolean {
    switch (current) {
      case 1:
        return name.trim().length > 0 && surname.trim().length > 0;
      case 2:
        return phone.trim().length > 0;
      case 3:
        return isValidEmail(email);
      case 4:
        return consentPrivacy; // required
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
    <main className="min-h-screen bg-[#f8f2ea] text-[#5b4b41]">
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-16 sm:px-6 lg:px-0">
        {/* HEADER */}
        <header className="text-center">
          <p className="text-[0.8rem] font-semibold uppercase tracking-[0.3em] text-[#8a7463]">
            Reservations
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl text-[#3f3127]">
            Reserve a table
          </h1>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#5b4b41] max-w-xl mx-auto">
            Ti guidiamo in pochi passaggi: lascia i tuoi dati, scegli il numero di
            persone, la data e l’orario. Il tavolo viene tenuto in blocco mentre
            confermi.
          </p>
        </header>

        {/* STEPPER */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-[#8a7463]">
          {steps.map((s) => {
            const isCurrent = step === s;
            const isCompleted = s < step;

            return (
              <button
                key={s}
                type="button"
                onClick={isCompleted ? () => setStep(s) : undefined}
                className="flex flex-col items-center gap-1 focus-visible:outline-none"
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm transition
                    ${
                      isCurrent
                        ? "border-[#5b4b41] bg-[#5b4b41] text-[#f5ede4]"
                        : isCompleted
                        ? "border-[#5b4b41] bg-[#f8f2ea] text-[#5b4b41]"
                        : "border-[#e1d6c9] bg-white text-[#b19c88]"
                    }`}
                >
                  {isCompleted ? "✓" : s}
                </div>
                <span className="text-[0.65rem] text-[#8a7463]">
                  {stepLabel(s)}
                </span>
              </button>
            );
          })}
        </div>

        {/* STEP CARD */}
        <section className="mt-8 rounded-3xl border border-[#e1d6c9] bg-white/95 p-6 sm:p-8 shadow-sm">
          {/* STEP 1 – Name and surname */}
          {step === 1 && (
            <div className="space-y-6 max-w-md mx-auto">
              <div className="text-center space-y-2">
                <h2 className="text-sm sm:text-base font-semibold uppercase tracking-[0.2em] text-[#8a7463]">
                  Step 1 · Name and surname
                </h2>
                <p className="text-sm sm:text-base text-[#5b4b41]">
                  Inizia lasciando nome e cognome per la prenotazione.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1 text-sm">
                  <span className="text-xs uppercase tracking-[0.18em] text-[#8a7463]">
                    First name
                  </span>
                  <input
                    className="rounded-full border border-[#e1d6c9] bg-white px-4 py-2.5 text-sm text-[#5b4b41] placeholder-[#b19c88] outline-none transition focus:border-[#5b4b41]"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Mario"
                  />
                </label>

                <label className="grid gap-1 text-sm">
                  <span className="text-xs uppercase tracking-[0.18em] text-[#8a7463]">
                    Last name
                  </span>
                  <input
                    className="rounded-full border border-[#e1d6c9] bg:white px-4 py-2.5 text-sm text-[#5b4b41] placeholder-[#b19c88] outline-none transition focus:border-[#5b4b41]"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="Rossi"
                  />
                </label>
              </div>

              <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled
                  className="rounded-full border border-transparent px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#c4b1a0] cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canGoNext(1)}
                  className="w-full sm:w-auto rounded-full bg-[#5b4b41] px-8 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#f5ede4] transition hover:bg-[#46362c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 – Phone */}
          {step === 2 && (
            <div className="space-y-6 max-w-md mx-auto">
              <div className="text-center space-y-2">
                <h2 className="text-sm sm:text-base font-semibold uppercase tracking-[0.2em] text-[#8a7463]">
                  Step 2 · Phone number
                </h2>
                <p className="text-sm sm:text-base text-[#5b4b41]">
                  Lascia un numero di telefono per eventuali comunicazioni sulla
                  prenotazione.
                </p>
              </div>

              <div className="rounded-2xl border border-[#e1d6c9] bg-[#f8f2ea]/70 p-4 text-sm text-[#5b4b41]">
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  <span className="font-mono">{displayName || "—"}</span>
                </p>
              </div>

              <label className="grid gap-1 text-sm">
                <span className="text-xs uppercase tracking-[0.18em] text-[#8a7463]">
                  Phone
                </span>
                <input
                  type="tel"
                  className="rounded-full border border-[#e1d6c9] bg-white px-4 py-2.5 text-sm text-[#5b4b41] placeholder-[#b19c88] outline-none transition focus:border-[#5b4b41]"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[+0-9]*$/.test(value)) {
                      setPhone(value);
                    }
                  }}
                  placeholder="+39 ..."
                />
              </label>

              <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={goBack}
                  className="w-full sm:w-auto rounded-full border border-[#e1d6c9] px-8 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#5b4b41] transition hover:border-[#5b4b41]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canGoNext(2)}
                  className="w-full sm:w-auto rounded-full bg-[#5b4b41] px-8 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#f5ede4] transition hover:bg-[#46362c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 – Email */}
          {step === 3 && (
            <div className="space-y-6 max-w-md mx-auto">
              <div className="text-center space-y-2">
                <h2 className="text-sm sm:text-base font-semibold uppercase tracking-[0.2em] text-[#8a7463]">
                  Step 3 · Email
                </h2>
                <p className="text-sm sm:text-base text-[#5b4b41]">
                  Useremo questa email per inviarti la conferma della prenotazione.
                </p>
              </div>

              <div className="rounded-2xl border border-[#e1d6c9] bg-[#f8f2ea]/70 p-4 text-sm text-[#5b4b41] space-y-1">
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  <span className="font-mono">{displayName || "—"}</span>
                </p>
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  <span className="font-mono">{phone || "—"}</span>
                </p>
              </div>

              <label className="grid gap-1 text-sm">
                <span className="text-xs uppercase tracking-[0.18em] text-[#8a7463]">
                  Email
                </span>
                <input
                  type="email"
                  className="rounded-full border border-[#e1d6c9] bg-white px-4 py-2.5 text-sm text-[#5b4b41] placeholder-[#b19c88] outline-none transition focus:border-[#5b4b41]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                />
                {email && !isValidEmail(email) && (
                  <span className="mt-1 text-[0.8rem] text-red-500">
                    Please enter a valid email address.
                  </span>
                )}
              </label>

              <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={goBack}
                  className="w-full sm:w-auto rounded-full border border-[#e1d6c9] px-8 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#5b4b41] transition hover:border-[#5b4b41]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canGoNext(3)}
                  className="w-full sm:w-auto rounded-full bg-[#5b4b41] px-8 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#f5ede4] transition hover:bg-[#46362c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 – Terms and conditions */}
          {step === 4 && (
            <div className="space-y-6 max-w-md mx-auto">
              <div className="text-center space-y-2">
                <h2 className="text-sm sm:text-base font-semibold uppercase tracking-[0.2em] text-[#8a7463]">
                  Step 4 · Terms and conditions
                </h2>
                <p className="text-sm sm:text-base text-[#5b4b41]">
                  Gestisci i consensi per il trattamento dei tuoi dati personali.
                </p>
              </div>

              <div className="rounded-2xl border border-[#e1d6c9] bg-[#f8f2ea]/70 p-4 text-sm text-[#5b4b41] space-y-1">
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  <span className="font-mono">{displayName || "—"}</span>
                </p>
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  <span className="font-mono">{phone || "—"}</span>
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  <span className="font-mono">{email || "—"}</span>
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7463]">
                  Terms and conditions
                </p>
                <p className="text-[0.85rem] text-[#5b4b41]">
                  Acconsento all’utilizzo dei miei dati per:
                </p>

                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-[3px] h-4 w-4 rounded border-[#e1d6c9] text-[#5b4b41]"
                    checked={consentMarketing}
                    onChange={(e) => setConsentMarketing(e.target.checked)}
                  />
                  <span>
                    Marketing e comunicazioni{" "}
                    <span className="text-xs text-[#8a7463]">Facoltativo</span>
                  </span>
                </label>

                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-[3px] h-4 w-4 rounded border-[#e1d6c9] text-[#5b4b41]"
                    checked={consentProfiling}
                    onChange={(e) => setConsentProfiling(e.target.checked)}
                  />
                  <span>
                    Profilazione{" "}
                    <span className="text-xs text-[#8a7463]">Facoltativo</span>
                  </span>
                </label>

                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-[3px] h-4 w-4 rounded border-[#e1d6c9] text-[#5b4b41]"
                    checked={consentPrivacy}
                    onChange={(e) => setConsentPrivacy(e.target.checked)}
                  />
                  <span>
                    Privacy e trattamento dati{" "}
                    <span className="text-red-500">*</span>{" "}
                    <span className="text-xs text-[#8a7463]">Obbligatorio</span>
                  </span>
                </label>

                <label className="flex items-start gap-2 text-sm pt-2 border-t border-[#e1d6c9] mt-2">
                  <input
                    type="checkbox"
                    className="mt-[3px] h-4 w-4 rounded border-[#e1d6c9] text-[#5b4b41]"
                    checked={consentAll}
                    onChange={(e) => handleToggleAll(e.target.checked)}
                  />
                  <span>Autorizzo tutti i trattamenti</span>
                </label>

                {!consentPrivacy && (
                  <p className="text-[0.8rem] text-red-500">
                    Il consenso privacy è necessario per proseguire.
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={goBack}
                  className="w-full sm:w-auto rounded-full border border-[#e1d6c9] px-8 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#5b4b41] transition hover:border-[#5b4b41]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canGoNext(4)}
                  className="w-full sm:w-auto rounded-full bg-[#5b4b41] px-8 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#f5ede4] transition hover:bg-[#46362c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 5 – Number of guests */}
          {step === 5 && (
            <div className="space-y-6 max-w-md mx-auto">
              <div className="text-center space-y-2">
                <h2 className="text-sm sm:text-base font-semibold uppercase tracking-[0.2em] text-[#8a7463]">
                  Step 5 · Number of guests
                </h2>
                <p className="text-sm sm:text-base text-[#5b4b41]">
                  Quante persone saranno al tavolo?
                </p>
              </div>

              <div className="rounded-2xl border border-[#e1d6c9] bg-[#f8f2ea]/70 p-4 text-sm text-[#5b4b41] space-y-1">
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  <span className="font-mono">{displayName || "—"}</span>
                </p>
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  <span className="font-mono">{phone || "—"}</span>
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  <span className="font-mono">{email || "—"}</span>
                </p>
              </div>

              <label className="grid gap-1 text-sm">
                <span className="text-xs uppercase tracking-[0.18em] text-[#8a7463]">
                  Number of guests
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="rounded-full border border-[#e1d6c9] bg-white px-4 py-2.5 text-sm text-[#5b4b41] placeholder-[#b19c88] outline-none transition focus:border-[#5b4b41]"
                  value={party}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      const num = value === "" ? 0 : parseInt(value, 10);
                      if (num === 0 || (num >= 1 && num <= 20)) {
                        setParty(num);
                      }
                    }
                  }}
                  placeholder="2"
                />
              </label>

              <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={goBack}
                  className="w-full sm:w-auto rounded-full border border-[#e1d6c9] px-8 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#5b4b41] transition hover:border-[#5b4b41]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canGoNext(5)}
                  className="w-full sm:w-auto rounded-full bg-[#5b4b41] px-8 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#f5ede4] transition hover:bg-[#46362c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 6 – Date */}
          {step === 6 && (
            <div className="space-y-6 max-w-md mx-auto">
              <div className="text-center space-y-2">
                <h2 className="text-sm sm:text-base font-semibold uppercase tracking-[0.2em] text-[#8a7463]">
                  Step 6 · Choose the date
                </h2>
                <p className="text-sm sm:text-base text-[#5b4b41]">
                  Seleziona la data in cui vuoi venire a cena.
                </p>
              </div>

              <div className="rounded-2xl border border-[#e1d6c9] bg-[#f8f2ea]/70 p-4 text-sm text-[#5b4b41]">
                <p>
                  <span className="font-semibold">Guests:</span>{" "}
                  <span className="font-mono">{party}</span>
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-[#8a7463] text-center">
                  Date
                </p>
                <Calendar value={date} onChange={setDate} minDate={minDate} />
              </div>

              <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={goBack}
                  className="w-full sm:w-auto rounded-full border border-[#e1d6c9] px-8 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#5b4b41] transition hover:border-[#5b4b41]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canGoNext(6)}
                  className="w-full sm:w-auto rounded-full bg-[#5b4b41] px-8 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#f5ede4] transition hover:bg-[#46362c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  See available times
                </button>
              </div>
            </div>
          )}

          {/* STEP 7 – Time + waitlist */}
          {step === 7 && (
            <div className="space-y-6 max-w-xl mx-auto">
              <div className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                  <h2 className="text-sm sm:text-base font-semibold uppercase tracking-[0.2em] text-[#8a7463]">
                    Step 7 · Choose the time
                  </h2>
                  <p className="text-sm sm:text-base text-[#5b4b41]">
                    Seleziona uno degli orari disponibili. Il tavolo verrà tenuto
                    mentre confermi la prenotazione.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-full border border-[#e1d6c9] px-6 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[#5b4b41] transition hover:border-[#5b4b41]"
                >
                  Edit details
                </button>
              </div>

              <div className="rounded-2xl border border-[#e1d6c9] bg-[#f8f2ea]/70 p-4 text-sm text-[#5b4b41] space-y-1">
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  <span className="font-mono">{displayName || "—"}</span>
                </p>
                <p>
                  <span className="font-semibold">Guests:</span>{" "}
                  <span className="font-mono">{party}</span>
                </p>
                <p>
                  <span className="font-semibold">Date:</span>{" "}
                  <span className="font-mono">{date}</span>
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7463] text-center">
                  Available times
                </h3>

                {isLoadingSlots ? (
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center justify-center rounded-xl border border-[#e1d6c9] bg-[#f8f2ea]/80 px-3 py-2 animate-pulse"
                      >
                        <div className="h-3 w-10 rounded bg-[#e1d6c9]" />
                        <div className="mt-2 h-3 w-14 rounded-full bg-[#e1d6c9]" />
                      </div>
                    ))}
                  </div>
                ) : slots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {slots.map((s) => (
                      <button
                        key={s.time}
                        disabled={s.available === 0 || isHolding}
                        onClick={() => clickSlot(s.time)}
                        className={`flex flex-col items-center justify-center rounded-xl border px-3 py-2 text-sm transition
                          ${
                            s.available
                              ? "border-[#e1d6c9] bg-white hover:border-[#5b4b41] hover:bg-[#f8f2ea]"
                              : "border-[#e1d6c9] bg-[#f8f2ea]/60 opacity-50 cursor-not-allowed"
                          }
                          ${
                            pickedTime === s.time
                              ? "border-[#5b4b41] bg-[#f8f2ea]"
                              : ""
                          }`}
                      >
                        <span className="text-[#3f3127]">{s.time}</span>
                        {s.suggestedArea ? (
                          <span className="mt-1 rounded-full bg-[#f8f2ea] px-2 py-[2px] text-[0.6rem] uppercase tracking-[0.16em] text-[#8a7463] border border-[#e1d6c9]">
                            {s.suggestedArea}
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#8a7463] text-center">
                    Nessun orario disponibile per questa combinazione di data e coperti.
                    Prova a cambiare giorno o numero di ospiti, oppure unisciti alla
                    waitlist.
                  </p>
                )}
              </div>

              {/* waitlist suggestion */}
              {!isLoadingSlots && !anyAvailable && !hasForm && (
                <div className="mt-4 rounded-2xl border border-[#beafa1] bg-[#f5ede4] p-4 text-sm text-[#5b4b41]">
                  <p className="font-semibold text-[0.95rem]">
                    Nessuna disponibilità per questa data.
                  </p>
                  <p className="mt-1 text-[0.85rem]">
                    Puoi unirti alla waitlist: ti avviseremo via email se si libera un
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
                        "You have been added to the waitlist. We'll email you if a table opens up."
                      );
                      setShowWaitlist(false);
                      setPickedTime(null);
                    } else {
                      const { error } = await res
                        .json()
                        .catch(() => ({ error: "Error" }));
                      alert(error || "Unable to add you to the waitlist");
                    }
                  }}
                  className="mt-6 max-w-md mx-auto space-y-3 rounded-2xl border border-[#e1d6c9] bg-white p-5"
                >
                  <div className="text-sm text-[#5b4b41]">
                    <span className="font-semibold">Join the waitlist</span> for{" "}
                    <span className="font-mono">{date}</span> • {party} guests
                  </div>

                  <label className="grid gap-1 text-sm">
                    <span className="text-xs uppercase tracking-[0.18em] text-[#8a7463]">
                      Notes (optional)
                    </span>
                    <textarea
                      rows={3}
                      className="rounded-2xl border border-[#e1d6c9] bg-white px-4 py-2.5 text-sm text-[#5b4b41] outline-none transition focus:border-[#5b4b41]"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </label>

                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-1 justify-center">
                    <button className="rounded-full bg-[#5b4b41] px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#f5ede4] transition hover:bg-[#46362c]">
                      Confirm waitlist
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-[#e1d6c9] px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#5b4b41] transition hover:border-[#5b4b41]"
                      onClick={() => setShowWaitlist(false)}
                    >
                      Cancel
                    </button>
                  </div>

                  <p className="text-[0.75rem] text-[#8a7463] text-center">
                    Ti avviseremo via email se si libera un tavolo in questa data.
                  </p>
                </form>
              )}
            </div>
          )}
        </section>

        {/* MODAL with notes only + countdown */}
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
