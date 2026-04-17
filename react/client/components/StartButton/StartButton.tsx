import React, { useRef, useEffect, useCallback } from 'react';
import * as stylex from '@stylexjs/stylex';
import { useSnapshot } from 'valtio';
import state from '../../state';

export enum StartButtonState {
  Camera = 'camera',
  Record = 'record',
  RecordDisabled = 'record-disabled',
}

const styles = stylex.create({
  button: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    userSelect: 'none',
    padding: 0,
    outline: 'none',
  },
  lightTheme: {
    border: '2px solid #333',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  darkTheme: {
    border: '2px solid rgba(255, 255, 255, 0.7)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  buttonHoverLight: {
    '@media (hover: hover)': {
      ':hover': {
        transform: 'scale(1.05)',
        borderColor: '#007AFF',
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
      },
    },
  },
  buttonHoverDark: {
    '@media (hover: hover)': {
      ':hover': {
        transform: 'scale(1.05)',
        borderColor: '#5AC8FA',
        backgroundColor: 'rgba(90, 200, 250, 0.18)',
      },
    },
  },
  buttonActiveLight: {
    ':active': {
      transform: 'scale(0.9)',
      borderColor: '#007AFF',
      backgroundColor: 'rgba(0, 122, 255, 0.2)',
    },
  },
  buttonActiveDark: {
    ':active': {
      transform: 'scale(0.9)',
      borderColor: '#5AC8FA',
      backgroundColor: 'rgba(90, 200, 250, 0.25)',
    },
  },
  buttonActiveTouch: {
    '@media (hover: none)': {
      ':active': {
        transform: 'scale(0.85)',
        transition: 'all 0.1s ease',
      },
    },
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    pointerEvents: 'none',
  },
  svgContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    width: '32px',
    height: '32px',
  },
});

// Theme-aware colors
const themeColors = {
  light: {
    cameraStroke: '#007AFF',
    cameraFill: 'white',
    recordStroke: '#333333',
    disabledFill: '#ccc',
    disabledStroke: '#999',
  },
  dark: {
    cameraStroke: '#5AC8FA',
    cameraFill: 'rgba(255, 255, 255, 0.18)',
    recordStroke: 'rgba(255, 255, 255, 0.85)',
    disabledFill: 'rgba(255, 255, 255, 0.25)',
    disabledStroke: 'rgba(255, 255, 255, 0.4)',
  },
};

type StartButtonProps = {
  state: StartButtonState;
  onClick: () => void;
  disabled?: boolean;
};

const StartButton: React.FC<StartButtonProps> = ({
  state: buttonState,
  onClick,
  disabled = false,
}) => {
  const { theme } = useSnapshot(state.general);
  const isDark = theme === 'dark';
  const colors = isDark ? themeColors.dark : themeColors.light;

  const rectRef = useRef<SVGRectElement>(null);
  const mainCircleRef = useRef<SVGCircleElement>(null);
  const smallCircleRef = useRef<SVGCircleElement>(null);

  const updateIconState = useCallback(() => {
    const rect = rectRef.current;
    const mainCircle = mainCircleRef.current;
    const smallCircle = smallCircleRef.current;

    if (!rect || !mainCircle || !smallCircle) return;

    switch (buttonState) {
      case StartButtonState.Camera:
        rect.setAttribute('rx', '8');
        rect.setAttribute('fill', colors.cameraFill);
        rect.setAttribute('stroke', colors.cameraStroke);
        mainCircle.setAttribute('opacity', '1');
        mainCircle.setAttribute('stroke', colors.cameraStroke);
        smallCircle.setAttribute('opacity', '1');
        smallCircle.setAttribute('stroke', colors.cameraStroke);
        break;
      case StartButtonState.Record:
        rect.setAttribute('rx', '26.88');
        rect.setAttribute('fill', 'red');
        rect.setAttribute('stroke', colors.recordStroke);
        mainCircle.setAttribute('opacity', '0');
        smallCircle.setAttribute('opacity', '0');
        break;
      case StartButtonState.RecordDisabled:
        rect.setAttribute('rx', '26.88');
        rect.setAttribute('fill', colors.disabledFill);
        rect.setAttribute('stroke', colors.disabledStroke);
        mainCircle.setAttribute('opacity', '0');
        smallCircle.setAttribute('opacity', '0');
        break;
    }
  }, [buttonState, colors]);

  useEffect(() => {
    updateIconState();
  }, [updateIconState]);

  const isDisabled = disabled || buttonState === StartButtonState.RecordDisabled;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      {...stylex.props(
        styles.button,
        isDark ? styles.darkTheme : styles.lightTheme,
        isDark ? styles.buttonHoverDark : styles.buttonHoverLight,
        isDark ? styles.buttonActiveDark : styles.buttonActiveLight,
        styles.buttonActiveTouch,
        isDisabled && styles.disabled
      )}
    >
      <div {...stylex.props(styles.svgContainer)}>
        <svg {...stylex.props(styles.svg)} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <style>
            {`
              .animated-rect {
                transition: rx 0.5s ease, fill 0.5s ease;
              }
              .animated-circle {
                transition: opacity 0.3s ease;
              }
            `}
          </style>
          <rect
            ref={rectRef}
            className="animated-rect"
            fill="none"
            stroke="#333"
            strokeLinecap="round"
            strokeLinejoin="round"
            height="26.88"
            rx="8"
            width="26.88"
            x="2.56"
            y="2.56"
          />
          <circle
            ref={mainCircleRef}
            className="animated-circle"
            fill="none"
            stroke="#333"
            strokeLinecap="round"
            strokeLinejoin="round"
            cx="16"
            cy="16"
            r="5.97"
          />
          <circle
            ref={smallCircleRef}
            className="animated-circle"
            fill="none"
            stroke="#333"
            strokeLinecap="round"
            strokeLinejoin="round"
            cx="23.34"
            cy="8.33"
            r="1.7"
          />
        </svg>
      </div>
    </button>
  );
};

export default StartButton;
