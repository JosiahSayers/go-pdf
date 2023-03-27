import AnalyticsModal from '~/components/modals/AnalyticsModal';
import EditPdfModal from '~/components/modals/EditPdfModal';
import QrCodeModal from '~/components/modals/QrCodeModal';

export const definedModals = {
  analytics: AnalyticsModal,
  edit: EditPdfModal,
  qrCode: QrCodeModal,
};

declare module '@mantine/modals' {
  export interface MantineModalsOverride {
    modals: typeof definedModals;
  }
}
