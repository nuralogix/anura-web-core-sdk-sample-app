import { Routes, Route } from 'react-router';
import NotFound from '../../pages/NotFound';
import MeasurementPage from '../../pages/MeasurementPage';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<MeasurementPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
