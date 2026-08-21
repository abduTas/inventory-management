export function applyBestPromotion(
  subtotal: number,
  promotions: Array<{
    name?: string;
    discount_type: string;
    discount_value: number;
  }>
): { discount: number; promotionName?: string } {
  let bestDiscount = 0;
  let promotionName: string | undefined;

  for (const promo of promotions) {
    let discount = 0;
    if (promo.discount_type === "percentage") {
      discount = subtotal * (Number(promo.discount_value) / 100);
    } else {
      discount = Number(promo.discount_value);
    }
    if (discount > bestDiscount) {
      bestDiscount = discount;
      promotionName = promo.name;
    }
  }

  return { discount: Math.min(bestDiscount, subtotal), promotionName };
}
