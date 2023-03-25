import AnalyticsModal from "~/components/modals/AnalyticsModal";
import PasswordProtectionModal from "~/components/modals/PasswordProtectionModal";

export const definedModals = {
  analytics: AnalyticsModal,
  passwordProtect: PasswordProtectionModal,
};

declare module '@mantine/modals' {
  export interface MantineModalsOverride {
    modals: typeof definedModals;
  }
}
