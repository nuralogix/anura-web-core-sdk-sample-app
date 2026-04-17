import { Loading } from '@nuralogix.ai/web-ui';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  stoppingOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.75)',
    zIndex: 10,
  },
});

const ResettingOverlay = () => (
  <div {...stylex.props(styles.stoppingOverlay)}>
    <Loading />
  </div>
);

export default ResettingOverlay;
