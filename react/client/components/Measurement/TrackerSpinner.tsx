import { Loading } from '@nuralogix.ai/web-ui';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  spinner: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '3rem',
  },
});

const TrackerSpinner = () => (
  <div {...stylex.props(styles.spinner)}>
    <Loading />
  </div>
);

export default TrackerSpinner;
