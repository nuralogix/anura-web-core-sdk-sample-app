import { Routes, Route } from 'react-router';
import NotFound from '../../pages/NotFound';
import MeasurementPage from '../../pages/MeasurementPage';
import ViewResults from '../ViewResults';
import ProfileForm from '../ProfileForm';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="profile" element={<ProfileForm />} />
      <Route path="/" element={<MeasurementPage />} />
      <Route path="/results" element={<ViewResults />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
