import { useParams } from 'react-router';

export default function ActivityEditor() {
    const { id } = useParams();
    return (
        <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900">Activity editor</h1>
        <p className="mt-2 text-slate-600">
        Editor for activity <span className="font-mono">{id}</span> — coming
        in step 3.
        </p>
        </div>
        </main>
    );
}
