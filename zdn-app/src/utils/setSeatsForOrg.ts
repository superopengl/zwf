import { EntityManager } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { OrgSeats } from '../entity/OrgSeats';
import { assert } from './assert';


export async function setSeatsForOrg(m: EntityManager, orgId: string, expectedSeats: number) {
  assert(expectedSeats >= 1, 400, `expectedSeats must be equal or greater than 1. But given ${expectedSeats}`);

  const allSeats = await m.find(OrgSeats, { orgId });
  const totalCurrentSeats = allSeats.length;

  let seated = 0;
  let vacancy = 0;
  const vacancySeats: OrgSeats[] = [];
  for (const seat of allSeats) {
    if (seat.userId) {
      seated++;
    } else {
      vacancy++;
      vacancySeats.push(seat);
    }
  }

  if (totalCurrentSeats < expectedSeats) {
    // Add seats
    const numToAdd = expectedSeats - totalCurrentSeats;
    for (let i = 0; i < numToAdd; i++) {
      const seat = new OrgSeats();
      seat.id = uuidv4();
      seat.orgId = orgId;
      m.save(seat);
    }
  } else if (expectedSeats < totalCurrentSeats) {
    // Reduce seats
    const numToReduce = totalCurrentSeats - expectedSeats;
    assert(numToReduce <= vacancy, 400, `Cannot set ${expectedSeats} seats as there are ${seated} being occupied now`);
    for (let i = 0; i < numToReduce; i++) {
      m.delete(OrgSeats, { id: vacancySeats[i].id });
    }
  } else {
    assert(false, 400, `No need to change seats`);
  }
}
