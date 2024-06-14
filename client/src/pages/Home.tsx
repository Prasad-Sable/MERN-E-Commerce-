import { Link } from "react-router-dom"
import ProductCard from "../components/ProductCard"

const Home = () => {

  const addToCartHandeler = () =>{}
  return (
    <div className="home">
      <section></section>
      <h1>Latest Products
        <Link to="/search" className="findmore">
          More
        </Link>
      </h1>
      <main>
        
          <ProductCard
          productId="mkkm"
          name="Macbook"
          price={89000}
          stock={12}
          handler={addToCartHandeler}
          photo="../assets/cover.jpg"
          />
      </main>
    </div>
  )
}

export default Home