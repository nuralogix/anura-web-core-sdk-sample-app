import React, { useState } from 'react';
import { TextInput } from '@nuralogix.ai/web-ui';
import { useTranslation } from 'react-i18next';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },
  inputWrapper: {
    flex: 1,
  },
});

interface ImperialHeightFieldProps {
  feet: string;
  inches: string;
  onFeetChange: (value: string) => void;
  onInchesChange: (value: string) => void;
}

const ImperialHeightField: React.FC<ImperialHeightFieldProps> = ({
  feet,
  inches,
  onFeetChange,
  onInchesChange,
}) => {
  const { t } = useTranslation();
  const [feetTouched, setFeetTouched] = useState(false);
  const [inchesTouched, setInchesTouched] = useState(false);

  const isFeetInvalid = () => {
    if (!feet) return false;
    const feetNum = parseInt(feet);
    return isNaN(feetNum) || feetNum < 3 || feetNum > 7;
  };

  const isInchesInvalid = () => {
    if (!inches) return false;
    const inchesNum = parseInt(inches);
    return isNaN(inchesNum) || inchesNum < 0 || inchesNum > 11;
  };

  const handleFeetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFeetChange(e.target.value);
  };

  const handleInchesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInchesChange(e.target.value);
  };

  const handleFeetBlur = () => {
    setFeetTouched(true);
  };

  const handleInchesBlur = () => {
    setInchesTouched(true);
  };

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.inputWrapper)}>
        <TextInput
          label={t('PROFILE_FORM_HEIGHT_FEET_LABEL')}
          value={feet}
          onChange={handleFeetChange}
          placeholder="5"
          type="text"
          invalid={feetTouched && isFeetInvalid()}
          invalidMessage={t('PROFILE_FORM_VALIDATION_HEIGHT_FEET')}
          onBlur={handleFeetBlur}
        />
      </div>
      <div {...stylex.props(styles.inputWrapper)}>
        <TextInput
          label={t('PROFILE_FORM_HEIGHT_INCHES_LABEL')}
          value={inches}
          onChange={handleInchesChange}
          placeholder="11"
          type="text"
          invalid={inchesTouched && isInchesInvalid()}
          invalidMessage={t('PROFILE_FORM_VALIDATION_HEIGHT_INCHES')}
          onBlur={handleInchesBlur}
        />
      </div>
    </div>
  );
};

export default ImperialHeightField;
