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

  // week starting on Monday
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
      {/* Month header */}
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

      {/* Weekdays */}
      <div className="mb-1 grid grid-cols-7 text-center text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-zinc-500">
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
            const isDisabled = isBefore(d, min);
            const isSelected = !!selectedDate && isSameDay(d, selectedDate);
            const isToday = isSameDay(d, today);
            const inCurrentMonth = d.getMonth() === currentMonth.getMonth();

            const base =
              "flex h-9 w-9 items-center justify-center rounded-full border text-xs transition-colors duration-150 focus-visible:outline-none";

            let style = "";

            if (isSelected) {
              // 🔥 selected = solid orange ALWAYS
              style =
                "border-amber-400 bg-amber-400 text-black shadow-[0_0_0_1px_rgba(251,191,36,0.4)] hover:bg-amber-400 hover:border-amber-400";
            } else if (isDisabled) {
              style = "border-zinc-800 bg-zinc-950 text-zinc-600 opacity-30 cursor-not-allowed";
            } else {
              style = inCurrentMonth
                ? "border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-amber-400 hover:bg-amber-500/20 hover:text-amber-100"
                : "border-zinc-900 bg-zinc-950 text-zinc-600";

              // today (only if not selected)
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
          <span>Selected date</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex h-3 w-3 rounded-full border border-zinc-600" />
          <span>Available</span>
        </div>
      </div>
    </div>
  );
}

export default function BookPage() {
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
      const { error } = await res.json().catch(() => ({ error: "Booking failed" }));
      alert(error || "Booking failed");
      return;
    }

    alert("Reservation confirmed! Check your email for details.");

    // minimal UI reset
    setPickedTime(null);
    clearHoldState();

    // refresh availability if we're still on step 7
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
        return "Name and surname";
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

        {/* Stepper with clickable dots (backwards) */}
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
          {/* STEP 1 – Name and surname */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  Step 1 · Name and surname
                </h2>
                <p className="mt-2 text-sm text-zinc-300">
                  Start by leaving us your first and last name for the reservation.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 sm:max-w-xl">
                <label className="grid gap-1 text-sm">
                  <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                    First name
                  </span>
                  <input
                    className="rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-400"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Mario"
                  />
                </label>

                <label className="grid gap-1 text-sm">
                  <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                    Last name
                  </span>
                  <input
                    className="rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-400"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="E.g. Rossi"
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
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 – Phone */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  Step 2 · Phone number
                </h2>
                <p className="mt-2 text-sm text-zinc-300">
                  Enter a phone number for any communications about your reservation.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-black/40 p-4 text-sm text-zinc-300">
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  <span className="font-mono text-zinc-100">{displayName || "—"}</span>
                </p>
              </div>

              <label className="grid gap-1 text-sm sm:max-w-xs">
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                  Phone
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
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canGoNext(2)}
                  className="rounded-full bg-amber-500 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue
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
                  We&apos;ll use this email to send you the confirmation and details of
                  your reservation.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-black/40 p-4 text-sm text-zinc-300">
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  <span className="font-mono text-zinc-100">{displayName || "—"}</span>
                </p>
                <p className="mt-1">
                  <span className="font-semibold">Phone:</span>{" "}
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
                  placeholder="example@email.com"
                />
                {email && !isValidEmail(email) && (
                  <span className="mt-1 text-[0.75rem] text-red-400">
                    Please enter a valid email address.
                  </span>
                )}
              </label>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-full border border-zinc-700 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-100 transition hover:border-amber-400 hover:text-amber-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canGoNext(3)}
                  className="rounded-full bg-amber-500 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 – Terms and conditions */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  Step 4 · Terms and conditions
                </h2>
                <p className="mt-2 text-sm text-zinc-300">
                  Manage consents for the processing of your personal data.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-black/40 p-4 text-sm text-zinc-300 space-y-1">
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  <span className="font-mono text-zinc-100">{displayName || "—"}</span>
                </p>
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  <span className="font-mono text-zinc-100">{phone || "—"}</span>
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  <span className="font-mono text-zinc-100">{email || "—"}</span>
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  Terms and conditions
                </p>
                <p className="text-[0.8rem] text-zinc-400">
                  I consent to the use of my data for:
                </p>

                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-[3px] h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-amber-500"
                    checked={consentMarketing}
                    onChange={(e) => setConsentMarketing(e.target.checked)}
                  />
                  <span>
                    Marketing and communications consent{" "}
                    <span className="text-xs text-zinc-500">Details</span>
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
                    Profiling consent{" "}
                    <span className="text-xs text-zinc-500">Details</span>
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
                    Privacy and data processing{" "}
                    <span className="text-red-400">*</span>{" "}
                    <span className="text-xs text-zinc-500">Details</span>
                  </span>
                </label>

                <label className="flex items-start gap-2 text-sm pt-1 border-t border-zinc-800 mt-2">
                  <input
                    type="checkbox"
                    className="mt-[3px] h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-amber-500"
                    checked={consentAll}
                    onChange={(e) => handleToggleAll(e.target.checked)}
                  />
                  <span>I authorize all processing</span>
                </label>

                {!consentPrivacy && (
                  <p className="text-[0.75rem] text-red-400">
                    Privacy and data processing consent is required to continue.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-full border border-zinc-700 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-100 transition hover:border-amber-400 hover:text-amber-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canGoNext(4)}
                  className="rounded-full bg-amber-500 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 5 – Number of guests */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  Step 5 · Number of guests
                </h2>
                <p className="mt-2 text-sm text-zinc-300">
                  How many people will be at the table?
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-black/40 p-4 text-sm text-zinc-300 space-y-1">
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  <span className="font-mono text-zinc-100">{displayName || "—"}</span>
                </p>
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  <span className="font-mono text-zinc-100">{phone || "—"}</span>
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  <span className="font-mono text-zinc-100">{email || "—"}</span>
                </p>
              </div>

              <label className="grid gap-1 text-sm sm:max-w-xs">
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                  Number of guests
                </span>
                <input
                  type="text"
                  inputMode="numeric" // numeric keypad on mobile
                  className="rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-400"
                  value={party}
                  onChange={(e) => {
                    const value = e.target.value;
                    // digits only (0–9)
                    if (/^\d*$/.test(value)) {
                      const num = value === "" ? 0 : parseInt(value, 10);
                      // limit between 1 and 20 (or allow empty)
                      if (num === 0 || (num >= 1 && num <= 20)) {
                        setParty(num);
                      }
                    }
                  }}
                  placeholder="E.g. 2"
                />
              </label>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-full border border-zinc-700 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-100 transition hover:border-amber-400 hover:text-amber-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canGoNext(5)}
                  className="rounded-full bg-amber-500 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 6 – Date */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  Step 6 · Choose the date
                </h2>
                <p className="mt-2 text-sm text-zinc-300">
                  Select the date when you want to reserve the table.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-black/40 p-4 text-sm text-zinc-300 space-y-1">
                <p>
                  <span className="font-semibold">Guests:</span>{" "}
                  <span className="font-mono text-zinc-100">{party}</span>
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                  Date
                </p>
                <Calendar value={date} onChange={setDate} minDate={minDate} />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-full border border-zinc-700 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-100 transition hover:border-amber-400 hover:text-amber-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canGoNext(6)}
                  className="rounded-full bg-amber-500 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  See available times
                </button>
              </div>
            </div>
          )}

          {/* STEP 7 – Time + waitlist */}
          {step === 7 && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
                    Step 7 · Choose the time
                  </h2>
                  <p className="mt-2 text-sm text-zinc-300">
                    Select one of the available time slots. The table will be held while
                    you confirm the reservation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-full border border-zinc-700 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-zinc-100 transition hover:border-amber-400 hover:text-amber-200"
                >
                  Edit details
                </button>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-black/40 p-4 text-sm text-zinc-300 space-y-1">
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  <span className="font-mono text-zinc-100">{displayName || "—"}</span>
                </p>
                <p>
                  <span className="font-semibold">Guests:</span>{" "}
                  <span className="font-mono text-zinc-100">{party}</span>
                </p>
                <p>
                  <span className="font-semibold">Date:</span>{" "}
                  <span className="font-mono text-zinc-100">{date}</span>
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Available times
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
                    No time slots available for this selection. Try another date or a
                    different number of guests, or join the waitlist.
                  </p>
                )}
              </div>

              {/* waitlist suggestion */}
              {!isLoadingSlots && !anyAvailable && !hasForm && (
                <div className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
                  <p className="font-semibold text-[0.9rem]">
                    No availability for this date.
                  </p>
                  <p className="mt-1 text-[0.8rem] text-amber-100/90">
                    You can join the waitlist and we&apos;ll let you know by email if a
                    table becomes available.
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
                        "You have been added to the waitlist. We&apos;ll email you if a table opens up."
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
                  className="mt-6 max-w-xl space-y-3 rounded-2xl border border-zinc-800 bg-black/50 p-5"
                >
                  <div className="text-sm text-zinc-200">
                    <span className="font-semibold">Join the waitlist</span> for{" "}
                    <span className="font-mono">{date}</span> • {party} guests
                  </div>

                  <label className="grid gap-1 text-sm">
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
                      Confirm waitlist
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
                    We&apos;ll notify you by email if a table opens up on this date.
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
