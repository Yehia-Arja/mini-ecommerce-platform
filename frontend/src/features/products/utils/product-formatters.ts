export function formatProductPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price)
}

export function getProductVariantSummary(variantCount: number) {
  return variantCount <= 1
    ? 'Ready to add to cart'
    : `${variantCount} variants available`
}
