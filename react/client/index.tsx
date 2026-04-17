import { createRoot } from 'react-dom/client';
import App from './App';
import AppErrorBoundary from './components/AppErrorBoundary';
import './styles.css';

const container = document.getElementById('root') as Element;
const root = createRoot(container);

root.render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);
