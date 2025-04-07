const {connectDB} = require('./db/db.connect')
connectDB()

// Import fs
const fs = require('fs')

// Import models
const Product = require('./models/techgenix_products.model')
const Category = require('./models/techgenix_categories.model')
const User = require('./models/user.model')
const Cart = require('./models/cart.model')
const Wishlist = require('./models/wishlist.model')
const Orders = require('./models/orders.model')

// import express
const express = require('express')
const app = express()
app.use(express.json())

// import cors
const cors = require('cors')
const corsOptions = {
    origin: '*',
}
app.use(cors(corsOptions))

// Read all products from database
async function readAll() {
    try {
        const products = await Product.find()
        return products
    } catch (error) {
        console.log("Error reading data", error)
    }
}

app.get('/products', async(req, res) => {
    try {
        const products = await readAll()
        if(products.length !=0) {
            res.status(200).json({productData: products})
        } else {
            res.status(404).json({error: "404. Products not found."})
        }
    } catch(error) {
        res.status(500).json({error: "Error fetching data, Try again later!"})
    }
})

// Read a product by productId
async function readByProductId(productId) {
    try {
        const product = await Product.findById(productId)
        return product
    } catch(error) {
        console.log("Error reading data", error)
    }
}

app.get('/products/:productId', async(req, res) => {
    try {
        const product = await readByProductId(req.params.productId)
        if(product) {
            res.json(product)
        } else {
            res.status(404).json({error: "404. Product Not Found."})
        }
    } catch(error) {
        res.status(500).json({error: "Failed to fetch product data. Try again later!"})
    }
})

// Read all categories from database
async function readAllCategories() {
    try {
        const categories = await Category.find()
        return categories
    } catch(error) {
        console.log(error)
    }
}

app.get("/categories", async(req, res) => {
    try {
        const categories = await readAllCategories()
        if(categories.length !=0) {
            res.json(categories)
        } else {
            res.status(404).json({error: "404. Categories Not Found."})
        }
    } catch(error) {
        res.status(500).json({error:"Error fetching categories from database."})
    }
})

// Read a category by Name
async function readCategoryByName(categoryName) {
    try {
        const category = await Category.findOne({category: categoryName})
        return category
    } catch(error) {
        console.log(error)
    }
}

app.get('/categories/:categoryName', async(req, res) => {
    try {
        const category = await readCategoryByName(req.params.categoryName)
        if(category) {
            res.json(category)
        } else {
            res.status(404).json({error: "404. Category Not Found."})
        }
    } catch (error) {
        res.status(500).json({error: "Error fetching category."})
    }
})

//* User Management
// Registering a new user (On registering it automatically creates cart, orders, wishlist for that user)
async function registerUser(userData) {
    try {
        const newUser = new User(userData)
        const saveUser =  await newUser.save()
        return saveUser
    } catch(error) {
        console.log(error)
    }
}

app.post('/register', async(req, res) => {
    try {
        const newUser = await registerUser(req.body)
        if(newUser) {
            res.status(201).json({message: "User Registered Successfully."})
        }
    } catch (error) {
        res.status(500).json({error: "Failed to register user. Try again later!"})
    }
})

// Get user by userId
async function getUserDetails(userId) {
    try {
        const user = await User.findById(userId)
        return user
    } catch(error) {
        console.log(error)
    }
}


app.get('/login/:userId', async(req, res)=> {
    try {
        const user = await getUserDetails(req.params.userId)
        if(user) {
            res.json(user)
        } else {
            res.status(404).json({error: "404. User Not Found."})
        }
    } catch (error) {
        res.status(500).json({error: "Failed to fetch user. try again later!"})
    }
})

//* Address management
//(1) Add New Address
async function updateDetails(userId, updateDetails) {
    try {
        const user = await User.findByIdAndUpdate(userId, updateDetails, {new: true})
        return user
    } catch(error) {
        console.log(error)
    }
}

app.post('/update/:userId', async(req, res)=> {
    try {
        const user = await updateDetails(req.params.userId, req.body)
        if(user) {
            res.json({message: "User updated successfully"})
        } else {
            res.status(400).json({error: "Failed to update details."})
        }
    } catch (error) {
        res.status(500).json({error: "Failed to fetch user. try again later!"})
    }
})

//* Cart Management
//(1) Add/Update/Delete items
async function updateCart(userid, itemDetails) {
    try {
        const userCart = await Cart.findOne({userId: userid})
        if(userCart) {
            const updatedCart = await Cart.findOneAndUpdate({userId: userid}, itemDetails, {new:true})
            return updatedCart
        } else {
            const newCart = new Cart({
                userId: userid,
                items: itemDetails.items,
                totalPrice: itemDetails.totalPrice
            })
            const saveCart = await newCart.save()
            return saveCart
        }
    } catch(error) {
        console.log(error)
    }
}

app.post('/user/:userId/cart', async(req,res) => {
    try {
        const cart = await updateCart(req.params.userId, req.body)
        if(cart) {
            res.status(201).json({message: "Cart updated successfully"})
        } else {
            res.status(400).json({error: "Bad request."})
        }
    } catch (error) {
        res.status(500).json({error: "Error fetching cart"})
    }
})

//(2) Get All items from cart
async function readCart(userid) {
    try {
        const cart = await Cart.findOne({userId: userid})
        if(cart) {
            return cart
        } else {
            const newCart = new Cart({
                userId: userid,
            })
            const saveCart = await newCart.save()
            return saveCart
        }

    } catch (error) {
        console.log(error)
    }
}

app.get('/user/:userId/cart', async(req, res) => {
    try {
        const cart = await readCart(req.params.userId)
        if(cart) {
            res.json(cart)
        } else {
            res.status(404).json({error: "Cart Not Found."})
        }
    } catch (error) {
        res.status(500).json({error: "Error fetching data."})
    }
})


//(3) Populate All items from cart
async function populateCart(userid) {
    try {
        const cart = await Cart.findOne({userId: userid}).populate({
            path: "items.productId",
            select: "name image actualPrice discountPrice"
        })
        if(cart) {
            return cart
        } else {
            const newCart = new Cart({
                userId: userid,
            })
            const saveCart = await newCart.save()
            return saveCart
        }

    } catch (error) {
        console.log(error)
    }
}

app.get('/user/:userId/cart/populate', async(req, res) => {
    try {
        const cart = await populateCart(req.params.userId)
        if(cart) {
            res.json(cart)
        } else {
            res.status(404).json({error: "Cart Not Found."})
        }
    } catch (error) {
        res.status(500).json({error: "Error fetching data."})
    }
})


//* Wishlist Management
//(1) Read Wishlist data
async function readWishlist(userid) {
    try {
        const wishlist = await Wishlist.findOne({userId: userid})
        if(wishlist) {
            return wishlist.products
        } else {
            const newWishlist = new Wishlist({
                userId: userid,
            })
            const saveWishlist = await newWishlist.save()
            return saveWishlist.products
        }
    } catch(error) {
        console.log(error)
    }
}

app.get('/user/:userId/wishlist', async(req, res) => {
    try {
        const productsArray = await readWishlist(req.params.userId)
        if(productsArray) {
            res.json(productsArray)
        } else {
            res.status(404).json({error: "Wishlist not found."})
        }
    } catch (error) {
        res.status(500).json({error: "Error fetching wishlist data."})
    }
})


//(2) Add product to the wishlist
async function updateWishlist(userid, productIdObject) {


    try {
        const wishlist = await Wishlist.findOne({userId: userid})

        if(wishlist) {
            const updatedWishlist = await Wishlist.findOneAndUpdate({userId: userid}, {$push: {products: productIdObject.id}}, {new: true})
            return updatedWishlist
        } else {

            const newWishlist = new Wishlist({
                userId: userid,
                products: [productIdObject]
            })
            const saveWishlist = await newWishlist.save()

            return saveWishlist
        }
    } catch(error) {
        console.error("Error in updateWishlist:", error);
        throw error;
    }
}

app.post('/user/:userId/wishlist', async(req, res) => {

    try {
        const wishlist = await updateWishlist(req.params.userId, req.body)


        if(wishlist) {
            res.status(201).json({message: "Item Added to Wishlist!"})
        } else {
            res.status(400).json({error: "Failed to add item to wishlist."})
        }
    } catch (error) {
        res.status(500).json({error: error})
    }
})

//(3) Remove product from wishlist
async function deleteWishlistItem(userid, productIdObject) {
    try {
        const wishlist = await Wishlist.findOne({userId: userid})
        if(wishlist) {
            const updatedWishlist = await Wishlist.findOneAndUpdate({userId: userid}, {$pull: {products: productIdObject.id}})
            return updatedWishlist
        } else {
            const newWishlist = new Wishlist({
                userId: userid,
                products: [productIdObject.id]
            })
            const saveWishlist = await newWishlist.save()
            return saveWishlist
        }
    } catch(error) {
        console.log(error)
    }
}

app.post('/user/:userId/wishlist/del', async(req, res) => {
    try {
        const wishlist = await deleteWishlistItem(req.params.userId, req.body)
        if(wishlist) {
            res.status(201).json({message: "Item removed from the wishlist!"})
        } else {
            res.status(400).json({error: "Failed to remove item from the wishlist."})
        }
    } catch (error) {
        res.status(500).json({error: error})
    }
})

//(4)
async function populateWishlist(userid) {
    try {
        const wishlist = await Wishlist.findOne({userId: userid}).populate("products")
        if(wishlist) {
            return wishlist.products
        } else {
            const newWishlist = new Wishlist({
                userId: userid,
            })
            const saveWishlist = await newWishlist.save()
            return saveWishlist.products
        }
    } catch(error) {
        console.log(error)
    }
}

app.get('/user/:userId/wishlist/populate', async(req, res) => {
    try {
        const productsArray = await populateWishlist(req.params.userId)
        if(productsArray) {
            res.json(productsArray)
        } else {
            res.status(404).json({error: "Wishlist not found."})
        }
    } catch (error) {
        res.status(500).json({error: "Error fetching wishlist data."})
    }
})

//* Order Management
//(1) Place Order
async function placeOrder(orderDetails) {
    try {
        const newOrder = new Orders(orderDetails)
        const saveOrder = await newOrder.save()
        return saveOrder
    } catch (error) {
        console.log(error)
    }
}

app.post('/orders/newOrder', async(req, res) => {
    try {
        const order = await placeOrder(req.body)
        if(order) {
            res.status(201).json({message: "Order Placed Successfully!", orderId: order._id})
        } else {
            res.status(400).json({error: "Error placing order!"})
        }
    } catch (error) {   
        res.status(500).json({error: "Error Fetching data. Try again Later"})
    }
})

//(2) Fetch order by orderId
async function orderById(orderId) {
    try {
        const order = await Orders.findById(orderId).populate({
            path: "orderItems.productId",
            select: "name image actualPrice discountPrice"
        })
        return order
    } catch (error) {
        console.log(error)
    }
}

app.get('/orders/:orderId', async(req, res) => {
    try {
        const order = await orderById(req.params.orderId)
        if(order) {
            res.json(order)
        } else {
            res.status(404).json({error: "404! Order Not Found!"})
        }
    } catch (error) {   
        res.status(500).json({error: "Error Fetching data. Try again Later"})
    }
})

//(3) Fetch all orders by userId
async function readAllOrders(userid) {
    try {
        const orders = await Orders.find({userId: userid}).populate({
            path: "orderItems.productId",
            select: "name image actualPrice discountPrice"
        })
        return orders
    } catch (error) {
        console.log(error)
    }
}

app.get('/:userId/orders/', async(req, res) => {
    try {
        const orders = await readAllOrders(req.params.userId)
        if(orders.length != 0) {
            res.json(orders)
        } else {
            res.status(404).json({error: "404! Orders Not Found!"})
        }
    } catch (error) {   
        res.status(500).json({error: "Error Fetching data. Try again Later"})
    }
})

//* Search Bar

async function searchProducts(searchquery) {
  try {
    const keywords = searchquery.split(" ");

    const results = await Product.aggregate([
      {
        $search: {
          index: 'productsSearch',
          compound: {
            must: keywords.map(word => ({
              text: {
                query: word,
                path: "name"
              }
            }))
          }
        }
      },
      {
        $limit: 5
      }
    ]);
    return results
  } catch (err) {
    console.error('Search error:', err);
  }
}

app.get('/search/:input', async(req, res) => {
    try {
        const results = await searchProducts(req.params.input)
        if(results.length !=0) {
            res.json(results)
        } else {
            res.status(404).json({error: "Product Not Found!"})
        }
    } catch (error) {
        res.status(500).json({error: "Error Fetching data. Try again Later"})
    }
})


// Start the server
const PORT=3000
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})