import { getRepository } from 'typeorm';
import { Task } from '../entity/Task';
import { User } from '../entity/User';
import { sendEmailImmediately} from '../services/emailService';
import { Portfolio } from '../entity/Portfolio';
import { getEmailRecipientName } from './getEmailRecipientName';
import { getUserEmailAddress } from './getUserEmailAddress';


export async function sendNewPortfolioEmail(portfolio: Portfolio) {
  const user = await getRepository(User).findOne(portfolio.userId);

  await sendEmailImmediately({
    to: user.profile.email,
    // bcc: [SYSTEM_EMAIL_SENDER],
    template: 'createPortfolio',
    vars: {
      toWhom: getEmailRecipientName(user),
      portfolioName: portfolio.name,
    },
  });
}
