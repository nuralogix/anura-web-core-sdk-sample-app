import React from 'react';
import FormField from './FormField';
import MetricHeightField from './Fields/MetricHeightField';
import ImperialHeightField from './Fields/ImperialHeightField';
import AgeField from './Fields/AgeField';
import UnitSelector from './Fields/UnitSelector';
import WeightField from './Fields/WeightField';
import SexSelector from './Fields/SexSelector';
import { FormState } from './types';

interface ProfileInfoProps {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ formState, setFormState }) => {
  const isMetric = formState.unit === 'metric';

  const handleAgeChange = (value: string) => {
    setFormState((prev) => ({ ...prev, age: value }));
  };

  const handleUnitChange = (value: 'metric' | 'imperial') => {
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

  const handleSexChange = (value: string) => {
    setFormState((prev) => ({ ...prev, sex: value }));
  };

  return (
    <>
      <FormField>
        <AgeField value={formState.age} onChange={handleAgeChange} />
      </FormField>

      <FormField>
        <UnitSelector value={formState.unit} onChange={handleUnitChange} />
      </FormField>

      <FormField>
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
      </FormField>

      <FormField>
        <WeightField value={formState.weight} onChange={handleWeightChange} isMetric={isMetric} />
      </FormField>

      <FormField>
        <SexSelector value={formState.sex} onChange={handleSexChange} />
      </FormField>
    </>
  );
};

export default ProfileInfo;
