import QrCode from 'qrcode';
import { DeployInfo } from '~/utils/deploy-info.server';

async function createForFile(id: string) {
  return QrCode.toBuffer(`${DeployInfo.url}/qr?id=${id}`, {
    errorCorrectionLevel: 'H',
    type: 'png',
    scale: 10,
  });
}

export const QR = {
  createForFile,
};
