import { BrowserRouter, Routes, Route } from 'react-router-dom'  // handles page routing
import Home from './pages/Home'
import History from './pages/History.jsx'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />           {/* main chore page */}
                <Route path="/history" element={<History />} />  {/* history page */}
            </Routes>
        </BrowserRouter>
    )
}

export default App