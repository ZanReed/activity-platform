import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900">Activity Platform</h1>
        <p className="mt-2 text-slate-600">
          Phase 1 scaffold — Tailwind v4 + React 19 + TS + Vite.
        </p>
        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        >
          Clicks: {count}
        </button>
      </div>
    </main>
  );
}
