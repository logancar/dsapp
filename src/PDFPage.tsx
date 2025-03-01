import { useParams } from 'react-router-dom';
import styles from './PDFPage.module.css';

function PDFPage() {
  const { pdfName } = useParams();

  return (
    <div className={styles.container}>
      <h2>Placeholder Fillable PDF: {pdfName}</h2>
      <p>Eventually, embed a PDF viewer or fillable form here!</p>
    </div>
  );
}

export default PDFPage;
