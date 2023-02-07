import { cartPaydProducts, cartProducts, categoryProducts, creatProducts, deletProductsCart, postProductsCart } from "@/controllers";
import { authenticateToken, validateBody } from "@/middlewares";
import { creatUserSchema } from "@/schemas";
import { productsRoute } from "./productF2-rout";

productsRoute
  .all("/*", authenticateToken)
  .get("/cart", cartProducts)
  .delete("/remov/:id", deletProductsCart)
  .post("/cart", validateBody(creatUserSchema), postProductsCart)
  .get("/cart/payd", cartPaydProducts)
  .get("/category", categoryProducts)
  .post("/create", creatProducts)
  ;
  

export { productsRoute };
