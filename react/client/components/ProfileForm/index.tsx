import React, { useState } from 'react';
import { TextInput, RadioButtonGroup, Heading, Button, Card } from '@nuralogix.ai/web-ui';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: '100vh',
    padding: '40px 20px',
    backgroundColor: '#f8f9fa',
  },
  container: {
    padding: '32px',
    maxWidth: '480px',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  fieldWrapper: {
    marginBottom: '24px',
  },
  submitWrapper: {
    marginTop: '32px',
    display: 'flex',
    justifyContent: 'center',
  },
  submitButton: {
    minWidth: '160px',
    padding: '12px 24px',
  },
});

const ProfileForm = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [smoking, setSmoking] = useState('');
  const [bloodPressureMed, setBloodPressureMed] = useState('');
  const [diabetesStatus, setDiabetesStatus] = useState('');

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeight(e.target.value);
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeight(e.target.value);
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAge(e.target.value);
  };

  // Validation functions
  const getAgeError = () => {
    if (!age) return '';
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      return 'Age must be between 13 and 120 years';
    }
    return '';
  };

  const getHeightError = () => {
    if (!height) return '';
    const heightNum = parseInt(height);
    if (isNaN(heightNum) || heightNum < 120 || heightNum > 220) {
      return 'Height must be between 120 and 220 cm';
    }
    return '';
  };

  const getWeightError = () => {
    if (!weight) return '';
    const weightNum = parseInt(weight);
    if (isNaN(weightNum) || weightNum < 30 || weightNum > 300) {
      return 'Weight must be between 30 and 300 kg';
    }
    return '';
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Mock submit function - log the form data
    const formData = {
      height,
      weight,
      age,
      sex,
      smoking,
      bloodPressureMed,
      diabetesStatus,
    };

    console.log('Form submitted with data:', formData);

    // You could add additional logic here like:
    // - API calls to submit data
    // - Show success message
    // - Reset form
    // - Navigate to next page
  };

  const isFormValid = () => {
    return (
      !getHeightError() &&
      !getWeightError() &&
      !getAgeError() &&
      height &&
      weight &&
      age &&
      sex &&
      smoking &&
      bloodPressureMed &&
      diabetesStatus
    );
  };

  return (
    <div {...stylex.props(styles.wrapper)}>
      <div {...stylex.props(styles.container)}>
        <Heading>Profile Information</Heading>
        <form onSubmit={handleSubmit}>
          <div {...stylex.props(styles.fieldWrapper)}>
            <TextInput
              label="Height (cm)"
              value={height}
              onChange={handleHeightChange}
              placeholder="Enter your height"
              type="number"
              invalidMessage={getHeightError()}
            />
          </div>

          <div {...stylex.props(styles.fieldWrapper)}>
            <TextInput
              label="Weight (kg)"
              value={weight}
              onChange={handleWeightChange}
              placeholder="Enter your weight"
              type="number"
              invalidMessage={getWeightError()}
            />
          </div>

          <div {...stylex.props(styles.fieldWrapper)}>
            <TextInput
              label="Age"
              value={age}
              onChange={handleAgeChange}
              placeholder="Enter your age"
              type="number"
              invalidMessage={getAgeError()}
            />
          </div>

          <div {...stylex.props(styles.fieldWrapper)}>
            <RadioButtonGroup
              label="Sex (at birth)"
              value={sex}
              onChange={setSex}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ]}
            />
          </div>

          <div {...stylex.props(styles.fieldWrapper)}>
            <RadioButtonGroup
              label="Do you smoke?"
              value={smoking}
              onChange={setSmoking}
              options={[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ]}
            />
          </div>

          <div {...stylex.props(styles.fieldWrapper)}>
            <RadioButtonGroup
              label="Are you on blood pressure medication?"
              value={bloodPressureMed}
              onChange={setBloodPressureMed}
              options={[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ]}
            />
          </div>

          <div {...stylex.props(styles.fieldWrapper)}>
            <RadioButtonGroup
              label="Diabetes status"
              value={diabetesStatus}
              onChange={setDiabetesStatus}
              options={[
                { value: 'type1', label: 'Type 1' },
                { value: 'type2', label: 'Type 2' },
                { value: 'no', label: 'No' },
              ]}
            />
          </div>

          <div {...stylex.props(styles.submitWrapper)}>
            <Button type="submit" disabled={!isFormValid()} {...stylex.props(styles.submitButton)}>
              Submit Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
