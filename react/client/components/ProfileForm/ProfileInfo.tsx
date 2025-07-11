import React from 'react';
import MetricHeightField from './Fields/MetricHeightField';
import ImperialHeightField from './Fields/ImperialHeightField';
import AgeField from './Fields/AgeField';
import UnitSelector from './Fields/UnitSelector';
import WeightField from './Fields/WeightField';
import SexSelector from './Fields/SexSelector';
import { FormState, Unit, Sex } from './types';
import { FORM_VALUES } from './constants';

interface ProfileInfoProps {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ formState, setFormState }) => {
  const isMetric = formState.unit === FORM_VALUES.METRIC;

  const handleAgeChange = (value: string) => {
    setFormState((prev) => ({ ...prev, age: value }));
  };

  const handleUnitChange = (value: Unit) => {
    setFormState((prev) => ({ ...prev, unit: value }));
  };

  const handleHeightMetricChange = (value: string) => {
    setFormState((prev) => ({ ...prev, heightMetric: value }));
  };

  const handleHeightFeetChange = (value: string) => {
    setFormState((prev) => ({ ...prev, heightFeet: value }));
  };

  const handleHeightInchesChange = (value: string) => {
    setFormState((prev) => ({ ...prev, heightInches: value }));
  };

  const handleWeightChange = (value: string) => {
    setFormState((prev) => ({ ...prev, weight: value }));
  };

  const handleSexSelection = (value: Sex) => {
    setFormState((prev) => ({ ...prev, sex: value }));
  };

  return (
    <>
      <SexSelector value={formState.sex} onChange={handleSexSelection} />
      <AgeField value={formState.age} onChange={handleAgeChange} />
      <UnitSelector value={formState.unit} onChange={handleUnitChange} />
      {isMetric ? (
        <MetricHeightField value={formState.heightMetric} onChange={handleHeightMetricChange} />
      ) : (
        <ImperialHeightField
          feet={formState.heightFeet}
          inches={formState.heightInches}
          onFeetChange={handleHeightFeetChange}
          onInchesChange={handleHeightInchesChange}
        />
      )}
      <WeightField value={formState.weight} onChange={handleWeightChange} isMetric={isMetric} />
    </>
  );
};

export default ProfileInfo;
