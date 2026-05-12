import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './router';
import { useTheme } from './hooks/useTheme';

function App() {
  const location = useLocation();
  const { theme } = useTheme();

  return (
    <div className={`app-shell theme-${theme}`}>
      <Toaster position="top-center" reverseOrder={false} />
      <AnimatePresence mode="wait">
        <AppRoutes location={location} key={location.pathname} />
      </AnimatePresence>
    </div>
  );
}

export default App;

