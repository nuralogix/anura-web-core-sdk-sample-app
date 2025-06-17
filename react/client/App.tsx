import { useEffect } from 'react';
import { Container, ThemeProvider } from '@nuralogix.ai/web-ui';
import darkTheme from '@nuralogix.ai/web-ui/themes/dark';
import lightTheme from '@nuralogix.ai/web-ui/themes/light';
import state from './state';
import AppRouter from './components/AppRouter';
import Notification from './components/Notification';
import { LanguageInitializer } from './language/LanguageInitializer';
import Navbar from './components/Navbar/Navbar';
import { useSnapshot } from 'valtio';

const App = () => {
  const { theme } = useSnapshot(state.general);
  /**
   * Request camera permission on app load
   */
  useEffect(() => {
    (async () => await state.camera.requestPermission())();
  }, []);

  return (
    <LanguageInitializer>
      <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
        <Navbar />
        <Container>
          <AppRouter />
          <Notification />
        </Container>
      </ThemeProvider>
    </LanguageInitializer>
  );
};

export default App;
