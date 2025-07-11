import React from 'react';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  fieldWrapper: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '16px',
  },
  // For text inputs - reserves space for validation messages
  textInput: {
    minHeight: '90px', // Label + input + validation message space
  },
  // For radio buttons - compact spacing
  radioButton: {
    minHeight: '40px', // Just label + radio buttons
  },
});

interface FieldWrapperProps {
  children: React.ReactNode;
  variant?: 'textInput' | 'radioButton';
}

const FieldWrapper: React.FC<FieldWrapperProps> = ({ children, variant = 'radioButton' }) => {
  return (
    <div
      {...stylex.props(
        styles.fieldWrapper,
        variant === 'textInput' ? styles.textInput : styles.radioButton
      )}
    >
      {children}
    </div>
  );
};

export default FieldWrapper;
