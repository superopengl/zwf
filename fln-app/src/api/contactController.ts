
import { assert } from '../utils/assert';
import * as _ from 'lodash';
import { handlerWrapper } from '../utils/asyncHandler';
import { sendEmail } from '../services/emailService';
import * as delay from 'delay';

export const saveContact = handlerWrapper(async (req, res) => {
  const { name, company, contact, message } = req.body;
  assert(name && contact && message, 404, `Invalid contact information`);

  await sendEmail({
    template: 'contact',
    to: 'info@filedin.io',
    vars: {
      name,
      company,
      contact,
      message
    }
  });

  await delay(1000);

  res.json();
});
