import { ProductsCatalog } from '../../products'
import '../../products/pages/ProductsPage.css'

export function HomePage() {
  return (
    <main className="products-page">
      <div className="products-page__container">
        <section className="products-page__hero">
          <div className="products-page__hero-copy">
            <span className="products-page__eyebrow">Mini Ecommerce</span>
            <h1>Shop everyday essentials, all in one place.</h1>
            <p>
              Discover well-made picks across home, style, and tech, with easy
              browsing, clear options, and a smooth path to checkout.
            </p>
          </div>
        </section>

        <ProductsCatalog products={[]} isLoading />
      </div>
    </main>
  )
}
