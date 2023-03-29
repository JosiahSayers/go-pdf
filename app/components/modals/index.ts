import AnalyticsModal from '~/components/modals/AnalyticsModal';
import EditPdfModal from '~/components/modals/EditPdfModal';
import LoginModal from '~/components/modals/login-modal';
import QrCodeModal from '~/components/modals/QrCodeModal';

export const definedModals = {
  analytics: AnalyticsModal,
  edit: EditPdfModal,
  qrCode: QrCodeModal,
  login: LoginModal,
};

declare module '@mantine/modals' {
  export interface MantineModalsOverride {
    modals: typeof definedModals;
  }
}
