import { EntityManager } from 'typeorm';
import { assert } from '../../utils/assert';
import { OrgPromotionCode } from '../../entity/OrgPromotionCode';

export async function getDiscountInfoFromPromotionCode(m: EntityManager, promotionCode: string) {
  let promotionUnitPrice = null;
  let isValidPromotionCode = false;
  if (promotionCode) {
    const promotion = await m.getRepository(OrgPromotionCode)
      .createQueryBuilder()
      .where({ code: promotionCode })
      .andWhere(`"endingAt" > NOW()`)
      .getOne();


    if (promotion) {
      promotionUnitPrice = +promotion.promotionUnitPrice;
      assert(promotionUnitPrice >= 0, 500, `${promotionUnitPrice} is an invalid promotionUnitPrice by promotionCode ${promotionCode}`);
      isValidPromotionCode = true;
    }
  }
  return { promotionUnitPrice, isValidPromotionCode };
}
