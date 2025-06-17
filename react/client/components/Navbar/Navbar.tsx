import React from 'react';
import * as stylex from '@stylexjs/stylex';
import { useSnapshot } from 'valtio';
import state from '../../state';
import { Button } from '@nuralogix.ai/web-ui';

const styles = stylex.create({
  header: {
    backgroundColor: '#f0f0f0', // light grey
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '60px',
    borderBottom: '1px solid #ddd',
  },
  title: {
    fontSize: '1.25rem',
    marginLeft: '2rem',
    fontWeight: 600,
    color: '#333',
  },
  right: {
    marginRight: '2rem',
  },
});

const Navbar: React.FC = () => {
  const { theme, setTheme } = useSnapshot(state.general);

  return (
    <header {...stylex.props(styles.header)}>
      {/* TODO replace with right logo */}
      <div {...stylex.props(styles.title)}>WMS 2.0</div>
      <div {...stylex.props(styles.right)}>
        {/* TODO replace with toggle */}
        <Button variant="outline" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          Change theme
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
