import { FormattedMessage } from "react-intl";

export const getSubscriptionName = (type) => {
  return {
    free: <FormattedMessage id="text.proMemberFree"/>,
    unlimited_monthly:  <FormattedMessage id="text.proMemberMonthly"/>,
    unlimited_yearly:  <FormattedMessage id="text.proMemberAnnually"/>
  }[type];
};
