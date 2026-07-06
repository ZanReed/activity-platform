import { Routes, Route } from 'react-router';
import { SessionProvider } from './lib/SessionContext';
import RequireAuth from './components/RequireAuth';
import Home from './routes/Home';
import Activities from './routes/Activities';
import ActivityEditor from './routes/ActivityEditor';
import ActivityPrint from './routes/ActivityPrint';
import Submissions from './routes/Submissions';
import Playground from './routes/Playground';
import DevFoldableColumns from './routes/DevFoldableColumns';
import DevCalculator from './routes/DevCalculator';
import DevGraphQuestion from './routes/DevGraphQuestion';

export default function App() {
    return (
        <SessionProvider>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route
        path="/activities"
        element={
            <RequireAuth>
            <Activities />
            </RequireAuth>
        }
        />
        <Route
        path="/activity/:id"
        element={
            <RequireAuth>
            <ActivityEditor />
            </RequireAuth>
        }
        />
        <Route
        path="/activity/:id/print"
        element={
            <RequireAuth>
            <ActivityPrint />
            </RequireAuth>
        }
        />
        <Route
        path="/activity/:id/submissions"
        element={
            <RequireAuth>
            <Submissions />
            </RequireAuth>
        }
        />
        {import.meta.env.DEV && (
            <Route path="/playground" element={<Playground />} />
        )}
        {import.meta.env.DEV && (
            <Route path="/dev/foldable-columns" element={<DevFoldableColumns />} />
        )}
        {import.meta.env.DEV && (
            <Route path="/dev/calculator" element={<DevCalculator />} />
        )}
        {import.meta.env.DEV && (
            <Route path="/dev/graph-question" element={<DevGraphQuestion />} />
        )}
        </Routes>
        </SessionProvider>
    );
}
