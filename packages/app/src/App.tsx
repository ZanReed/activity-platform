import { Routes, Route } from 'react-router';
import { SessionProvider } from './lib/SessionContext';
import RequireAuth from './components/RequireAuth';
import Home from './routes/Home';
import Activities from './routes/Activities';
import ActivityEditor from './routes/ActivityEditor';
import Submissions from './routes/Submissions';
import Playground from './routes/Playground';

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
        </Routes>
        </SessionProvider>
    );
}
