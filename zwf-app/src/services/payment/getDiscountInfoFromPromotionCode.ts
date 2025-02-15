import { EntityManager } from 'typeorm';
import { assert } from '../../utils/assert';
import { OrgPromotionCode } from '../../entity/OrgPromotionCode';

export async function getDiscountInfoFromPromotionCode(m: EntityManager, promotionCode: string) {
  let promotionPlanPrice = null;
  let isValidPromotionCode = false;
  if (promotionCode) {
    const promotion = await m.getRepository(OrgPromotionCode)
      .createQueryBuilder()
      .where({ code: promotionCode })
      .andWhere(`"endingAt" > NOW()`)
      .getOne();


    if (promotion) {
      promotionPlanPrice = +promotion.promotionPlanPrice;
      assert(promotionPlanPrice >= 0, 500, `${promotionPlanPrice} is an invalid promotionPlanPrice by promotionCode ${promotionCode}`);
      isValidPromotionCode = true;
    }
  }
  return { promotionPlanPrice, isValidPromotionCode };
}
