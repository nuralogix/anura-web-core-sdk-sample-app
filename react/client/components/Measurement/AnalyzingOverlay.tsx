import { Loading, Paragraph } from '@nuralogix.ai/web-ui';
import { useTranslation } from 'react-i18next';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  analyzingOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.9)',
    zIndex: 20,
  },
  analyzingResults: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '2rem 0',
  },
});

const AnalyzingOverlay = () => {
  const { t } = useTranslation();
  return (
    <div {...stylex.props(styles.analyzingOverlay)}>
      <div {...stylex.props(styles.analyzingResults)}>
        <Loading />
        <Paragraph>{t('WAITING_FOR_RESULTS')}</Paragraph>
      </div>
    </div>
  );
};

export default AnalyzingOverlay;
