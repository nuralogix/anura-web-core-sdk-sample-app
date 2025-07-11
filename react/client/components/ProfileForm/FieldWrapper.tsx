import React from 'react';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  fieldWrapper: {
    marginBottom: '16px',
    minHeight: '60px',
    display: 'flex',
    flexDirection: 'column',
  },
});

interface FieldWrapperProps {
  children: React.ReactNode;
}

const FieldWrapper: React.FC<FieldWrapperProps> = ({ children }) => {
  return <div {...stylex.props(styles.fieldWrapper)}>{children}</div>;
};

export default FieldWrapper;
