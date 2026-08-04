export function ProductCardSkeleton() {
  return (
    <article
      className="product-card product-card--skeleton"
      aria-hidden="true"
    >
      <div className="product-card__media">
        <div className="product-card__image product-card__image--placeholder product-card__skeleton-block" />
      </div>

      <div className="product-card__body">
        <div className="product-card__meta">
          <span className="product-card__skeleton-line product-card__skeleton-line--sm" />
          <span className="product-card__skeleton-line product-card__skeleton-line--xs" />
        </div>

        <div className="product-card__copy">
          <span className="product-card__skeleton-line product-card__skeleton-line--lg" />
          <span className="product-card__skeleton-line product-card__skeleton-line--md" />
          <span className="product-card__skeleton-line product-card__skeleton-line--sm" />
        </div>

        <div className="product-card__footer">
          <span className="product-card__skeleton-chip" />
        </div>
      </div>
    </article>
  )
}
