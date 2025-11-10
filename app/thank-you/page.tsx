import Link from "next/link";
export const dynamic = "force-dynamic";

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-[#f8f2ea] text-[#5b4b41]">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 pb-20 pt-16 sm:px-6">
        <header className="text-center space-y-3">
          <p className="text-[0.8rem] font-semibold uppercase tracking-[0.3em] text-[#8a7463]">
            Reservations
          </p>
          <h1 className="font-display text-3xl sm:text-4xl text-[#3f3127]">
            Thank you
          </h1>
          <p className="text-sm sm:text-base text-[#5b4b41] max-w-md mx-auto">
            Your reservation is confirmed. We&apos;ve sent you an email with all the details.
          </p>
        </header>

        <section className="mt-8 w-full rounded-3xl border border-[#e1d6c9] bg-white/95 p-6 text-sm sm:text-base text-[#5b4b41] shadow-sm sm:p-8">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f8f2ea] border border-[#e1d6c9] text-lg">
              ✨
            </div>
            <p className="max-w-md">
              If you need to modify or cancel your booking, please use the link in the
              confirmation email you&apos;ve just received.
            </p>
            <p className="max-w-md">
              We look forward to welcoming you to{" "}
              <span className="font-semibold">Virtese</span>.
            </p>

            <div className="mt-5">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-[#5b4b41] px-8 py-2.5 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[#f5ede4] transition hover:bg-[#46362c]"
              >
                Back to home
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
