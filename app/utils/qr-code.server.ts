import QrCode from 'qrcode';

async function createForFile(id: string) {
  return QrCode.toBuffer(`http://localhost:3000/pdf/${id}`, {
    errorCorrectionLevel: 'H',
    type: "png",
    scale: 10,
  });
}

export const QR = {
  createForFile,
}
