const express = require("express");
const router = express.Router();
const {
  placeOrder,
  addCart,
  getCartList,
  removeCartItem,
  getAllProducts,
  getOrdersByUserId,
  deleteOrder,
  searchProduct,
} = require("../controllers/userController");
removeCartItem;

router.route("/placeOrder").post(placeOrder);
router.route("/addCart").post(addCart);
router.route("/getCartList").post(getCartList);
router.route("/removeCartItem").post(removeCartItem);
router.route("/getAllProducts").post(getAllProducts);
router.route("/getOrdersByUserId").post(getOrdersByUserId);
router.route("/deleteOrder").post(deleteOrder);
router.route("/searchProduct").get(searchProduct);

module.exports = router;
