export default function VerifyRequestPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-zinc-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-black/40 p-8 text-center shadow-xl backdrop-blur-md">
        <h1 className="font-display text-2xl font-semibold text-zinc-50">
          Check your email
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          We’ve sent you a secure sign-in link. Click it to access the staff area.
        </p>

        <div className="mt-8">
          <div className="mx-auto h-12 w-12 rounded-full border border-amber-400/60 bg-amber-500/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-amber-400"
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
        </div>

        <p className="mt-8 text-xs text-zinc-500">
          Didn’t receive it? Check your spam folder or try again in a few minutes.
        </p>
      </div>
    </main>
  )
}
