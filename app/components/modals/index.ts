import AnalyticsModal from "~/components/modals/AnalyticsModal";
import PasswordProtectionModal from "~/components/modals/PasswordProtectionModal";
import QrCodeModal from "~/components/modals/QrCodeModal";

export const definedModals = {
  analytics: AnalyticsModal,
  passwordProtect: PasswordProtectionModal,
  qrCode: QrCodeModal,
};

declare module '@mantine/modals' {
  export interface MantineModalsOverride {
    modals: typeof definedModals;
  }
}
