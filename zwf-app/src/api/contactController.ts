
import { assert } from '../utils/assert';
import * as _ from 'lodash';
import { handlerWrapper } from '../utils/asyncHandler';
import { sendEmailImmediately } from '../services/emailService';
import * as delay from 'delay';

export const saveContact = handlerWrapper(async (req, res) => {
  const { name, company, contact, message } = req.body;
  assert(name && contact && message, 404, `Invalid contact information`);

  await sendEmailImmediately({
    template: 'contact',
    to: 'techseeding2020@gmail.com',
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
