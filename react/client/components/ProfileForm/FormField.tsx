import React from 'react';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  fieldWrapper: {
    marginBottom: '24px',
    minHeight: '60px',
    display: 'flex',
    flexDirection: 'column',
  },
});

interface FormFieldProps {
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ children }) => {
  return <div {...stylex.props(styles.fieldWrapper)}>{children}</div>;
};

export default FormField;
