import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CalculatorPage from "./pages/calculator";
import SummaryPage from "./pages/summary";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CalculatorPage />} />
        <Route path="/summary" element={<SummaryPage />} />
      </Routes>
    </Router>
  );
}

export default App;
