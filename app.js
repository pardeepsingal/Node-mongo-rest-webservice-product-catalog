const express = require('express');
const bodyParser = require('body-parser');

// create express app
const app = express();

// Configuring the database
const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

// Connecting to the database
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...');
    process.exit();
});

let Schema = mongoose.Schema;
const categorySchema = new Schema({
    name:String,
    childs:[Array]
});
const Category = mongoose.model('Categories',categorySchema);

const productSchema = new Schema({
    sku:String,
    name:String,
    price:Number,
    categories:[String]
});
const Product = mongoose.model('Product',productSchema);


// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse requests of content-type - application/json
app.use(bodyParser.json())

app.use(function (req, res, next) {
    console.log(req.body) // populated!
    next()
})

app.get('/', (req, res) => {
    res.json({"message": "Welcome to Heady.io application. We have REST API using HTTP Verb to manage the categories/subcategories & their Products."});
});

// add new category
app.post('/newcategory', (req, res) => {
    var catTitle = req.body.name;
    var parentCategory = req.body.parent;

    Category.findOne({ name: parentCategory},function(error,cat) {

        if (error) {
            res.json(error);
        }
        else if(cat == null)
        {
            Category.create({
                name:catTitle,
                childs:[]
            }).then(category => {
                res.json(category);
            });
        }else{

            cat.childs.push(catTitle);
            Category.findOneAndUpdate({
                name:cat.name,
                childs:cat.childs,
            }).then(c => {
                res.json(c)
            });

            Category.create({
                name:catTitle,
                childs:[]
            }).then(category => {
                res.json(category);
            });
        }
    });
});

// add new product
app.post('/additem', (req, res) => {
    var prodTitle = req.body.name;
    var prodPrice = req.body.price;
    var categories = req.body.categories;
    var sku = req.body.sku;
    Product.findOne({ sku: sku},function(error,item) {

        if (error) {
            res.json(error);
        }
        else if(item == null)
        {
            Product.create({
                name:prodTitle,
                price:prodPrice,
                sku:sku,
                categories:categories
            }).then(item => {
                res.json(item);
            });
        }else{
            res.json("Item already exist!");
        }
    });
});

// Get Categories and their Childs
app.get('/getcategory/:category', (req, res) => {
    var name = req.params.category;
    console.log(`${name}`);
    Category.find({ name: name},function(error,catdetails) {

        if (error) {
            res.json(error);
        }
        else
        {
            res.json(catdetails);
        }
    });
});

//Get Products by category
app.get('/getproducts/:category', (req, res) => {
    var name = req.params.category;
    console.log(`${name}`);
    Product.find({ categories : { "$in" : [ name ] } }, function (err, products) {
        if (error) {
            res.json(error);
        }
        else
        {
            res.json(products);
        }
    });

});

//update product
app.put('/updateitem',(req,res) => {
    var prodTitle = req.body.name;
    var prodPrice = req.body.price;
    var categories = req.body.categories;
    var sku = req.body.sku;
    Product.findOne({ sku: sku},function(error,item) {

        if (error) {
            res.json(error);
        }
        else if(item == null)
        {
            res.json('item not found!');
        }else{
            item.price=prodPrice;
            item.name=prodTitle;
            item.categories=categories;
            item.save();
            res.json(item);
        }
    });

});
// listen for requests
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});