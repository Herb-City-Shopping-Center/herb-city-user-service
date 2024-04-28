const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModal");
const Product = require("../models/productModal");
const Cart = require("../models/cartModal");
const Shop = require("../models/shopModal");
const { green } = require("colors");

const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();

  if (products) {
    console.log("Product fetched!!!".green.bold);
    //send data to frontend in json format
    res.status(201).json({
      Products: products,
    });
  } else {
    console.log("Failed fetch products !!!".red.bold);
    //send error message to frontend
    res.status(400).json({
      error: "Failed to fetch products !!!",
    });
    throw new error("Failed to fetch products !!!");
  }
});

const placeOrder = asyncHandler(async (req, res) => {
  const { itemsInfo } = req.body;

  // console.log(itemsInfo);
  var orderCountInShop,
    newPayment = 0;
  if (!itemsInfo) {
    res.send(400);
    throw new error("Please enter all the fields!!!");
  }
  var customerIds = [];
  var shopIds = [];
  for (let i = 0; i < itemsInfo.length; i++) {
    customerIds.push(itemsInfo[i].customerId);
  }
  for (let i = 0; i < itemsInfo.length; i++) {
    shopIds.push(itemsInfo[i].shopId);
  }
  console.log(shopIds);

  const shops = await Shop.find({ _id: { $in: shopIds } });

  shops.forEach((shop, index) => {
    console.log(`${index} - `, shop._id);
    orderCountInShop = Number(shop.ordersCount) + 1;
    newPayment = Number(shop.payment) + 250;//add 250 lkr for each order as seller revenue
 
    console.log(orderCountInShop);

    Shop.findByIdAndUpdate(
      shop._id,
      { ordersCount: orderCountInShop, payment: newPayment },
      function (err, result) {
        if (err) {
          console.log(err);
        }
        console.log("RESULT: " + result);
      }
    );
  });

  await Order.insertMany(itemsInfo, function (err, result) {
    if (result) {
      var myquery = { customerId: { $in: customerIds } };

      Cart.deleteMany(myquery, function (err, obj) {
        if (err) throw err;
      });
      console.log("Order placed!!!".green.bold);
      res.status(201).json({
        status: "Success",
        result: result,
      });
    } else {
      console.log(err);
      console.log("Failed to Place Order !!!".red.bold);

      res.status(400).json({
        error: "Failed to Place Order !!!",
        errorMessage: err,
      });
    }
  });
});

// const addCart = asyncHandler(async (req, res) => {
//   const {
//     productId,
//     productImage,
//     productPrice,
//     productTitle,
//     customerId,
//     shopId,
//     quantity,
//   } = req.body;

//   if (
//     !productId ||
//     !productImage ||
//     !productPrice ||
//     !productTitle ||
//     !customerId ||
//     !shopId ||
//     !quantity
//   ) {
//     res.send(400);
//     throw new error("Please enter all the fields!!!");
//   }

//   const cart = await Cart.create({
//     productId,
//     productImage,
//     productPrice,
//     productTitle,
//     customerId,
//     shopId,
//     quantity,
//   });

//   if (cart) {
//     console.log("Added to cart!!!".green.bold);
//     res.status(201).json({
//       _id: cart._id,
//       productId: cart.productId,
//       productImage: cart.productImage,
//       productPrice: cart.productPrice,
//       productTitle: cart.productTitle,
//       customerId: cart.customerId,
//       shopId: cart.shopId,
//       quantity: cart.quantity,
//     });
//   } else {
//     console.log("Failed to adding cart !!!".red.bold);
//     res.status(400).json({
//       error: "Failed to adding cart !!!",
//     });
//     throw new error("Failed to adding cart !!!");
//   }
// });

// const getCartList = asyncHandler(async (req, res) => {
//   const { customerId } = req.body;

//   if (!customerId) {
//     res.send(400);
//     throw new error("No Customer ID!!!");
//   }

//   const cartList = await Cart.find({ customerId: { $in: customerId } });

//   if (cartList) {
//     res.send(cartList);
//     console.log(cartList);
//   } else {
//     console.log("Invalid shopId for fetch product".red.bold);
//     res.status(401);
//     throw new error("Invalid shopId for fetch product");
//   }
// });

// const removeCartItem = asyncHandler(async (req, res) => {
//   const { id } = req.body;

//   if (!id) {
//     console.log("Id is null".red.bold);
//     res.status(400).json({
//       error: "item id is null",
//     });
//     throw new error("Error while deleting item !!!");
//   } else {
//     try {
//       //find user by id and delete fron database
//       const cart = await Cart.findOneAndDelete({ _id: id });

//       //send success response message to the frontend
//       if (cart) {
//         res.status(201).json({
//           _id: id,
//         });
//         console.log("Item deleted".red.bold);
//       }
//     } catch (error) {
//       //send error response message to the frontend
//       res.status(400).json({
//         error: "Fail to delete item !!!",
//       });
//       throw new error("Error while deleting item !!!" + error.message);
//     }
//   }
// });

const getOrdersByUserId = asyncHandler(async (req,res)=>{
  const { userId } = req.body;

  if (!userId) {
    res.sendStatus(400);
    throw new error("No Customer ID!!!");
  }

  const orderList = await Order.find({ customerId: { $in: userId } });

  if (orderList) {
    res.send(orderList);
    console.log(orderList);
  } else {
    console.log("Invalid user Id for fetch orders".red.bold);
    res.status(401);
    throw new error("Invalid user Id for fetch orders");
  }
})

const deleteOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
console.log(orderId);
  if (!orderId) {
    res.status(400);
    throw new error("Required data not received into backend request!!!");
  } else {
    const deleteOrder = await Order.findOneAndDelete({ _id: orderId });

    if (deleteOrder) {
      res.status(201).json({
        _id: deleteOrder._id,
        productName: deleteOrder.productTitle,
      });
    } else {
      console.log("Errorrrrrrrrrrrrrrr");
      res.status(400);
      throw new error("Product not deleted !!!");
    }
  }
});

const searchProduct = asyncHandler(async (req, res) => {
  //getting keyword
  const keyword = req.query.search
    ? {
        $or: [
          { productTitle: { $regex: req.query.search, $options: "i" } }, //assign keyword find in productTitle
          { categoryName: { $regex: req.query.search, $options: "i" } }, //assign keyword find in categoryName
          { description: { $regex: req.query.search, $options: "i" } }, //assign keyword find in description
        ],
      }
    : {};

  //find user in databse by keyword
  const product = await Product.find(keyword);

  if(product){
    console.log(product);
  }
  else{
  console.log("No items.............");
  }
  //send data to frontend
  res.send(product);
});

const getShopByShopId = asyncHandler(async(req,res) =>{
  const { shopId } = req.body;

  console.log(shopId);

  if (!shopId) {
    res.send(400);
    throw new error("Please add shop Id!!!");
  }

  const shop = await Shop.findOne({ _id:shopId });

  if (shop) {
    console.log("Found!!!".green.bold);
    res.status(201).json({
      _id: shop._id,
      userId: shop.userId,
      shopName: shop.shopName,
      shopDescription: shop.shopDescription,
      shopAddress: shop.shopAddress,
      ratings: shop.ratings,
      shopImage: shop.shopImage,
    });
  } else {
    console.log("Failed to Get Shop !!!".red.bold);
    res.status(400).json({
      error: "Failed to Get Shop !!!",
    });
    throw new error("Failed to Get Shop !!!");
  }
});

const getProductbyShopId = asyncHandler(async(req,res)=>{
  const { shopId } = req.body;

  if (!shopId) {
    res.send(400);
    throw new error("No Shop ID!!!");
  }

  const productList = await Product.find({ shopId: { $in: shopId } });

  if (productList) {
    res.send(productList);
  } else {
    console.log("Invalid shop Id for fetch products".red.bold);
    res.status(401);
    throw new error("Invalid shop Id for fetch orders");
  }
})

module.exports = {
  placeOrder,
  getShopByShopId,
  getAllProducts,
  getOrdersByUserId,
  searchProduct,
  deleteOrder,
  getProductbyShopId,
};
