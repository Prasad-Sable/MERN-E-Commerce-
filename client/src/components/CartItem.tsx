import { FaTrash } from "react-icons/fa"
import { Link } from "react-router-dom"

type CardItemProps = {
    cartItem: any
}

const CartItem = ({cartItem}:CardItemProps) => {
    const {photo , productId , name ,price, quantity,stock} = cartItem
  return  <div className="cart-item">
        <img src={photo} alt={name} />
        <article>
            <Link to={`/product/${productId}`}>{name}</Link>
            <span>{price}</span>
        </article>
        <div>
            <button>-</button>
            <p>{quantity}</p>
            <button>+</button>
            
            <button>
                <FaTrash />
            </button>
        </div>
    </div>
}

export default CartItem