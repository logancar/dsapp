import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import DashboardPage from './DashboardPage';
import PDFPage from './PDFPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pdf/:pdfName" element={<PDFPage />} />
      </Routes>
    </Router>
  );
}

export default App;
