import { FormattedMessage } from "react-intl";

export const getSubscriptionName = (type) => {
  return {
    trial: <FormattedMessage id="text.proMemberFree"/>,
    monthly:  <FormattedMessage id="text.proMemberMonthly"/>,
    yearly:  <FormattedMessage id="text.proMemberAnnually"/>
  }[type];
};
