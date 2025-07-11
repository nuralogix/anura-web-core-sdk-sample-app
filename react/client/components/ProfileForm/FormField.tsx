import React from 'react';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  fieldWrapper: {
    marginBottom: '24px',
    minHeight: '60px',
    display: 'flex',
    flexDirection: 'column',
  },
  fieldRow: {
    marginBottom: '24px',
    minHeight: '60px',
    display: 'flex',
    flexDirection: 'row',
    gap: '16px',
  },
  fieldRowItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
});

interface FormFieldProps {
  children: React.ReactNode;
  layout?: 'column' | 'row';
}

const FormField: React.FC<FormFieldProps> = ({ children, layout = 'column' }) => {
  if (layout === 'row') {
    return (
      <div {...stylex.props(styles.fieldRow)}>
        {React.Children.map(children, (child, index) => (
          <div key={index} {...stylex.props(styles.fieldRowItem)}>
            {child}
          </div>
        ))}
      </div>
    );
  }

  return <div {...stylex.props(styles.fieldWrapper)}>{children}</div>;
};

export default FormField;
