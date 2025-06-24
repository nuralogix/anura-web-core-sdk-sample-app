import { Routes, Route } from 'react-router';
import NotFound from '../../pages/NotFound';
import MeasurementPage from '../../pages/MeasurementPage';
import ViewResults from '../ViewResults';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<MeasurementPage />} />
      <Route path="/results" element={<ViewResults />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
