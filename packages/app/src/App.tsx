import { Routes, Route } from 'react-router';
import { SessionProvider } from './lib/SessionContext';
import RequireAuth from './components/RequireAuth';
import ThemeToggle from './components/ThemeToggle';
import Home from './routes/Home';
import Activities from './routes/Activities';
import Classes from './routes/Classes';
import ActivityEditor from './routes/ActivityEditor';
import ActivityPrint from './routes/ActivityPrint';
import Submissions from './routes/Submissions';
import Playground from './routes/Playground';
import Privacy from './routes/Privacy';
import DevFoldableColumns from './routes/DevFoldableColumns';
import DevCalculator from './routes/DevCalculator';
import DevGraphQuestion from './routes/DevGraphQuestion';
import DevNumberLine from './routes/DevNumberLine';
import DevDataPlot from './routes/DevDataPlot';
import DevConfigDrawer from './routes/DevConfigDrawer';
import DevViewer from './routes/DevViewer';
import StudentViewer from './routes/StudentViewer';

export default function App() {
    return (
        <SessionProvider>
        <Routes>
        <Route path="/" element={<Home />} />
        {/* Public by design (D7): auth screens and student fineprint link here. */}
        <Route path="/privacy" element={<Privacy />} />
        {/* Student-facing viewer. Deliberately NOT wrapped in RequireAuth: the
            route itself shows the pre-auth screen (ruling 3.2A) so a signed-out
            student sees WHAT they were sent before being asked who they are. */}
        <Route path="/a/:activityId" element={<StudentViewer />} />
        <Route
        path="/activities"
        element={
            <RequireAuth>
            <Activities />
            </RequireAuth>
        }
        />
        <Route
        path="/classes"
        element={
            <RequireAuth>
            <Classes />
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
        {import.meta.env.DEV && (
            <Route path="/dev/number-line" element={<DevNumberLine />} />
        )}
        {import.meta.env.DEV && (
            <Route path="/dev/data-plot" element={<DevDataPlot />} />
        )}
        {import.meta.env.DEV && (
            <Route path="/dev/config-drawer" element={<DevConfigDrawer />} />
        )}
        {import.meta.env.DEV && (
            <Route path="/dev/viewer" element={<DevViewer />} />
        )}
        </Routes>
        <ThemeToggle />
        </SessionProvider>
    );
}
