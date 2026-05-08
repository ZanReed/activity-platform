import { Routes, Route } from 'react-router';
import Home from './routes/Home';
import Playground from './routes/Playground';

export default function App() {
    return (
        <Routes>
        <Route path="/" element={<Home />} />
        {import.meta.env.DEV && <Route path="/playground" element={<Playground />} />}
        </Routes>
    );
}
