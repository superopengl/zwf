import { SubscriptionType } from '../types/SubscriptionType';

function getUnitPricing(type: SubscriptionType) {
  switch (type) {
  case SubscriptionType.Trial:
    return 0;
  case SubscriptionType.Montly:
    return 19;
  case SubscriptionType.Yearly:
    return 209;
  default:
    throw new Error(`Unknown subscription type ${type}`);
  }
}

export function getSubscriptionPrice(type: SubscriptionType) {
  const unitPrice = getUnitPricing(type);
  return unitPrice;
}
