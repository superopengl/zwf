import * as voucherCodes from 'voucher-code-generator';

export function generateDeepLinkId() {
  const result = voucherCodes.generate({
    length: 64,
    count: 1,
    charset: voucherCodes.charset('alphanumeric')
  });
  return result[0];
}
