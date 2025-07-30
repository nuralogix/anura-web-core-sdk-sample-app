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
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  wrapper: {
    height: '100%',
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
});

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
        <Container>
          <div {...stylex.props(styles.wrapper)}>
            <Navbar />
            <AppRouter />
            <Notification />
          </div>
        </Container>
      </ThemeProvider>
    </LanguageInitializer>
  );
};

export default App;
