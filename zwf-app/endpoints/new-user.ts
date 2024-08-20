import 'colors';
import { computeEmailHash } from '../src/utils/computeEmailHash';
import { computeUserSecret } from '../src/utils/computeUserSecret';
import { v4 as uuidv4 } from 'uuid';


function createNewUser(email, password, salt) {

  const emailHash = computeEmailHash(email);
  const secret = computeUserSecret(password, salt);

  console.log('email    : ', email);
  console.log('emailHash: ', emailHash);
  console.log('password : ', email);
  console.log('secret   : ', secret);
  console.log('salt     : ', salt);
}

function main() {
  const myArgs = process.argv.slice(2);
  if (myArgs.length === 2 || myArgs.length === 3) {
    const [email, password, salt] = myArgs;
    createNewUser(email, password, salt || uuidv4());
    process.exit(0);
  } else {
    console.error('ts-node new-user.ts <email> <password> <salt>');
    process.exit(1)
  }
}

main();