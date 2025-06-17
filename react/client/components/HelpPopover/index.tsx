import { Popover, Button, Help, Camera, Glasses, Stopwatch, Paragraph } from '@nuralogix.ai/web-ui';
import { useTranslation } from 'react-i18next';
import * as stylex from '@stylexjs/stylex';

export const styles = stylex.create({
  icon: {
    textAlign: 'center',
  },
});

const helpItems = [
  { icon: <Camera height="30px" width="30px" />, textKey: 'KIOSK_HELP_CAMERA' as const },
  { icon: <Glasses height="30px" width="30px" />, textKey: 'KIOSK_HELP_ACCESSORIES' as const },
  { icon: <Stopwatch height="30px" width="30px" />, textKey: 'KIOSK_HELP_STAY' as const },
];

const HelpPopover = () => {
  const { t } = useTranslation();
  return (
    <Popover
      content={
        <div>
          {helpItems.map(({ icon, textKey }) => (
            <div key={textKey}>
              <div {...stylex.props(styles.icon)}>{icon}</div>
              <Paragraph>{t(textKey)}</Paragraph>
            </div>
          ))}
        </div>
      }
    >
      <Button variant="outline" icon={<Help width="18px" height="18px" />}>
        {t('HELP_TITLE')}
      </Button>
    </Popover>
  );
};

export default HelpPopover;
