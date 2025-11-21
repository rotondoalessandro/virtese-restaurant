export default function VerifyRequestPage() {
  return (
    <main className="min-h-screen bg-[#f7f2ec] text-[#5b4b41]">
      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        <div className="w-full rounded-[1.5rem] border border-[#e1d6c9] bg-white/90 p-7 text-center shadow-lg backdrop-blur-sm sm:p-9">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-[#8a7463]">Magic link sent</p>
          <h1 className="mt-3 font-display text-3xl leading-tight text-[#3f3127] sm:text-4xl">Check your email</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#5b4b41]">
            We have emailed you a secure sign-in link for the Virtese team area. Open it to continue.
          </p>

          <div className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-full border border-[#e1d6c9] bg-[#f8f2ea]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-[#5b4b41]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.125 1.935l-7.5 4.286a2.25 2.25 0 01-2.25 0L3.375 8.928A2.25 2.25 0 012.25 6.993V6.75"
              />
            </svg>
          </div>

          <div className="mt-8 space-y-2 text-xs leading-relaxed text-[#8a7463]">
            <p>Did not receive it? Check spam or wait a minute, then request again from the sign-in page.</p>
            <p>
              For help, email{' '}
              <a
                href="mailto:info@virtese.com"
                className="font-semibold underline decoration-[#d7c4b3] underline-offset-4 hover:text-[#3f3127]"
              >
                info@virtese.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
