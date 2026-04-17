import React from 'react';
import * as stylex from '@stylexjs/stylex';
import { useSnapshot } from 'valtio';
import state from '../../state';
import { stopMeasurementAndReset } from '../../utils/cameraControls';

const styles = stylex.create({
  button: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '1px solid transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
    outline: 'none',
    transition: 'background-color 0.2s ease',
    flexShrink: 0,
  },
  lightTheme: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    color: '#333',
  },
  darkTheme: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.7)',
    color: 'white',
  },
  buttonHoverLight: {
    '@media (hover: hover)': {
      ':hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderColor: 'rgba(0, 0, 0, 0.35)',
      },
    },
  },
  buttonHoverDark: {
    '@media (hover: hover)': {
      ':hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderColor: 'rgba(255, 255, 255, 0.75)',
      },
    },
  },
  svg: {
    width: '16px',
    height: '16px',
  },
});

const CloseButton: React.FC = () => {
  const { theme } = useSnapshot(state.general);
  const isDark = theme === 'dark';
  const iconColor = isDark ? '#ffffff' : '#333333';

  return (
    <button
      type="button"
      onClick={stopMeasurementAndReset}
      aria-label="Close"
      {...stylex.props(
        styles.button,
        isDark ? styles.darkTheme : styles.lightTheme,
        isDark ? styles.buttonHoverDark : styles.buttonHoverLight
      )}
    >
      <svg
        {...stylex.props(styles.svg)}
        viewBox="0 0 24 24"
        fill="none"
        stroke={iconColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
};

export default CloseButton;
