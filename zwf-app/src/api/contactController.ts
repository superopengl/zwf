import { db } from '../db';

import { assert } from '../utils/assert';
import { handlerWrapper } from '../utils/asyncHandler';
import { getReqUser } from '../utils/getReqUser';
import { isEmail } from 'validator';
import { Contact } from '../entity/Contact';
import { sleep } from '../utils/sleep';
import { sendEmail } from '../services/emailService';
import { EmailTemplateType } from '../types/EmailTemplateType';

export const submitContact = handlerWrapper(async (req, res) => {
  await sleep(2000);
  const user = getReqUser(req);
  assert(!user, 404);
  const { name, email, body } = req.body;

  assert(name, 400, 'name is not specified');
  assert(email, 400, 'email is not specified');
  assert(body, 400, 'body is not specified');
  assert(isEmail(email), 400, 'Invalid email address');

  const contact = new Contact();
  contact.name = name;
  contact.email = email;
  contact.body = body;

  await db.manager.save(contact);

  await sendEmail({
    to: email,
    template: EmailTemplateType.InboundContact,
    vars: {
      toWhom: name,
      body
    },
    shouldBcc: true,
  });

  res.json();
});
