import { EntityManager } from 'typeorm';
import { assert } from '../../utils/assert';
import { OrgPromotionCode } from '../../entity/OrgPromotionCode';

export async function getDiscountInfoFromPromotionCode(m: EntityManager, promotionCode: string) {
  let promotionDiscountPercentage = 0;
  let isValidPromotionCode = false;
  if (promotionCode) {
    const promotion = await m.getRepository(OrgPromotionCode)
      .createQueryBuilder()
      .where({ code: promotionCode })
      .andWhere(`"endingAt" > NOW()`)
      .getOne();

    if (promotion) {
      promotionDiscountPercentage = promotion.percentageOff;
      assert(0 < promotionDiscountPercentage && promotionDiscountPercentage < 1, 500, `Invalid promotion percentageOff by promotionCode ${promotionCode}`);
      isValidPromotionCode = true;
    }
  }
  return { promotionDiscountPercentage, isValidPromotionCode };
}
