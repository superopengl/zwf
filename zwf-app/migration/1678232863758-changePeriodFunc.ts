import { OrgSubscriptionPeriod } from './../src/entity/OrgSubscriptionPeriod';
import { LicenseTicket } from './../src/entity/LicenseTicket';
import { Payment } from './../src/entity/Payment';
import { MigrationInterface, QueryRunner } from "typeorm"
import { User } from '../src/entity/User';
import { OrgPromotionCode } from '../src/entity/OrgPromotionCode';

export class changePeriodFunc1678232863758 implements MigrationInterface {
    
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
CREATE OR REPLACE FUNCTION zwf.shift_org_subscription_history(org_id uuid, offset_days integer)
RETURNS void
LANGUAGE plpgsql
AS $$
declare
    time_offset interval;
    
begin
        
    if $1 is null then
    raise exception 'org_id cannot be null';
    end if;

    time_offset := make_interval(days => offset_days);
        
    update
    zwf.org_subscription_period
    set
    "periodFrom" = "periodFrom" + time_offset,
    "periodTo" = "periodTo" + time_offset,
    "checkoutDate" = "checkoutDate" + time_offset
    where
    "orgId" = $1;
    
    
    update
    zwf.license_ticket
    set
    "ticketFrom" = "ticketFrom" + time_offset,
    "ticketTo" = "ticketTo" + time_offset
    where
    "orgId" = $1;
    
    
    update
    zwf.payment
    set
    "createdAt" = "createdAt" + time_offset,
    "paidAt" = "paidAt" + time_offset
    where
    "orgId" = $1;
    
    
    update
    zwf.org_promotion_code
    set
    "createdAt" = "createdAt" + time_offset,
    "deletedAt" = "deletedAt" + time_offset,
    "endingAt" = "endingAt" + time_offset
    where
    "orgId" = $1;
    
    
    update
    zwf."user"
    set
    "createdAt" = "createdAt" + time_offset,
    "deletedAt" = "deletedAt" + time_offset
    where
    "orgId" = $1;
    

end;
$$
;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
