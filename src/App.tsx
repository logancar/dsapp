// App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import DashboardPage from './DashboardPage';
import PDFPage from './PDFPage';
import ThanksPage from './ThanksPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pdf/:pdfName" element={<PDFPage />} />
        <Route path="/thankyou" element={<ThanksPage />} />
      </Routes>
    </Router>
  );
}

export default App;
