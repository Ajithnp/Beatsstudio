const Product = require('../../../models/product-model')
const Category = require('../../../models/category-model')
const Brand =require('../../../models/brand-model')

const fs = require('fs')
const path = require('path')

const sharp = require('sharp')


exports.getProducts = async (req, res, next)=>{

    try {
           //Pagination
           const page = req.query.page*1 || 1;
           const limit = req.query.limit*1 || 8
           const skip = (page -1) * limit
           // query = query.skip(skip).limit(limit);
   
        const totalProducts = await Product.countDocuments()
        const productData = await Product.find().skip(skip).limit(limit).exec()
        return res.status(200).render('admin/product-list',{
            data: productData,
            page,
            totalPage: Math.ceil(totalProducts/limit)
        })

    } catch (error) {
        console.error('Error occured while loading product page', error)
        next(error)
        
    }
}

// Product detailed page Handler
exports.getProductDetailes = async (req, res, next)=>{
    const productId = req.params.id

    try {
        const product = await Product.findById(productId)
        .populate('brand', 'brandName')
        .populate('category', 'name')

        if(!product) {
            return res.status(404).render(404)
        }
        return res.status(200).render('admin/product-details',{product})
    } catch (error) {
        console.error('Error loading while product detail page', error);
        next(error)
        
    }
}





// Add product page get Handler
exports.addProductPage = async (req, res, next)=>{
    try {
        const category = await Category.find({isListed: false});
        const brand = await Brand.find({isBlocked: false})
        return res.status(200).render('admin/add-product',{
            cat: category,
            brand,
        })
        
    } catch (error) {
        console.error('Error occured while loading add Product page',error)
        next(error)
        
    }
}

// Product add post handler
exports.addProduct = async (req, res, next)=>{
    
    
    
    try {
        const products = req.body;
       
        
        const productExists = await Product.findOne({
            productName: products.productName,
        });

        if(! productExists){
            const images=[];
        

        if(req.files && req.files.length >0 ){
            for (let i=0; i<req.files.length; i++){
                const originalImagePath = req.files[i].path;
                const resizedImagePath = path.join('public', 'uploads', 'product-images' , req.files[i].filename);
                await sharp(originalImagePath).resize({width:1200, height:1486}).toFile(resizedImagePath);
                images.push(req.files[i].filename);
            }
        }

        // Fetch category id
        const categoryId = await Category.findOne({name: products.category});
        if(!categoryId){
            return res.status(400).json('Invalid category name')
        }

        // Fetch brand id
        const brandId = await Brand.findOne({ brandName: products.brand})
        if(!brandId) {
            return res.status(400).json('Invalid brand name');
        }

        // prepare color stock data

        const colorStock = [];
        for (let i = 0; i < req.body.colorStock.length; i++) {
           const color = req.body.colorStock[i].color;
           const quantity = Number(req.body.colorStock[i].quantity); // Convert to number
           const status = req.body.colorStock[i].status;

       colorStock.push({
          color: color,
          quantity: quantity,
          status: status,
      });
   }

      const tags = Array.isArray(products.tags) ? products.tags : [products.tags]; // Ensure tags is an array
    



        const newProduct = new Product({
            productName: products.productName,
            description: products.description,
            additionalInfo: products.additionalInfo,
            brand: brandId._id,
            category: categoryId._id,
            regularPrice: products.regularPrice,
            salePrice: products.salePrice,
            productOffer: products.productOffer || 0, // Default to 0 if not provided
            colorStock: colorStock,
            productImage: images,
            isBlocked: products.isBlocked === 'true', // Convert string to boolean
            tags:tags
        });



        await newProduct.save();
        return res.status(201).json({message: 'Product added successfully', product: newProduct})
        // return res.redirect('/api/v1/admin/products/addProduct')

      }else{
        return res.status(400).json('Product already exist, please try witg anoeger name')
      }
    } catch (error) {
        console.error('Error, while adding new produect', error.message)
        next(error)
       
        
    }
}


// Edit
exports.getProductEdit = async (req, res, next)=>{
    
    const id = req.params.id
   

    try {
        const product = await Product.findById(id)
        if(!product){
            return res.status(404).render('404')
        }

        const category = await Category.find({})
        const brand = await Brand.find({})
        res.status(200).render('admin/edit-product', {
            product,
            cat: category,
            brand,
        })
    } catch (error) {
        console.log('Error loading product edit page', error)
        next(error)
    }
}

// product Edit post Handler
exports.editProduct = async (req, res, next)=>{
    console.log('product editinf route', req.body);
    console.log('Product id in edit route', req.params.id);
    
    
    try {
        const id = req.params.id;
        // const product = await Product.findOne({_id: id});
        const data = req.body
        console.log('product edit handler...', data);

        // Check the product Exists
       const product = await Product.findOne({_id: id });
       if(!product) {
        return res.status(404).json({ message: 'Product not found..!'})
       }
        

        // Check product is exist
        const existingProduct = await Product.findOne({
            productName : data.productName,
            _id: {$ne: id}
        })
        if(existingProduct){
            return res.status(400).json({message: 'Product already exists with this naame..!'});
        }


        // Fetching brand category
        const [brandId, categoryId] = await Promise.all([
            Brand.findOne({ brandName: data.brand }),
            Category.findOne({ name: data.category})
        ]);

        if(! brandId) {
            return res.status(400).json({ message : 'Invalid brand name'});
        }

        if(! categoryId) {
            return res.status(400).json({ message : 'Invalid category name'})
        }

        // const images =[];

        // if(req.files && req.files.length > 0){
        //     for(let i=0; i<req.files.length; i++){
        //         images.push(req.files[i].filename);
        //     }
        // }

        const images = req.files ? req.files.map(file => file.filename) : [];

    //     const colorStock = [];
    //     for (let i = 0; i < req.body.colorStock.length; i++) {
    //        const color = req.body.colorStock[i].color;
    //        const quantity = Number(req.body.colorStock[i].quantity); // Convert to number
    //        const status = req.body.colorStock[i].status;

    //    colorStock.push({
    //       color: color,
    //       quantity: quantity,
    //       status: status,
    //   });

    // }

    const colorStock =(data.colorStock || []).map(item =>({
        color: item.color,
        quantity: Number(item.quantity),
        status: item.status,
    }));


       const tags = Array.isArray(data.tags) ? data.tags : [data.tags]; // Ensure tags is an array

        
       

       const updatedFields = {
        productName: data.productName,
        description: data.description,
        additionalInfo: data.additionalInfo,
        brand: brandId._id,
        category: categoryId._id,
        regularPrice: data.regularPrice,
        salePrice: data.salePrice,
        productOffer: data.productOffer || 0, // Default to 0 if not provided
        colorStock: colorStock,
        // productImage: images,
        isBlocked: data.isBlocked === 'true', // Convert string to boolean
        tags:tags
    };
       


        // if(images.length > 0){
        //    await Product.findByIdAndUpdate(id, {
        //     $push: { productImage: { $each: images }},
        //     ...updatedFields
        //    }, { new: true });

        // } else {
        //     await Product.findByIdAndUpdate(id, updatedFields,{new: true});

        // }
        await Product.findByIdAndUpdate(id, {
            $push: { productImage: { $each: images}},
            ...updatedFields
        }, {new: true});
       
        return res.status(200).json({message: "Product updated successfully..!"})
    
        
    
    }catch (error) {
        console.error('Error while adding edited product',error.message);
        next(error)
        
    }
}

// List product // Soft delete
exports.listProduct = async (req, res, next)=>{
    const { id }= req.query;
    console.log('heeloo', id)
    try {
         const product = await Product.findById(id)

         if(!product){
            return res.status(401).json({ message: "Product not found..!"})
         }

        await Product.updateOne({_id: id}, {$set: {isBlocked: true}})
        res.status(200).json({message: "Product has been listed successfully"});
    } catch (error) {
        console.error('Error occured while listing product', error)
        next(error)
        
    }
}

// Unlist product
 
exports.unlistProduct  = async (req, res, next)=>{
    const { id }= req.query
    console.log('hiiii',id)

    try {
        const product = await Product.findById(id)
       
        if(!product){
            return res.status(401).json({ message: "Product not found..!"})
        }

        await Product.updateOne({_id: id}, {$set:{isBlocked: false}})
        res.status(200).json({message: "Product has been unlisted successfully"})
    } catch (error) {
        console.error('Error occured while unlisting product', error)
        next(error)
        
    }
}

// Product image delete
exports.deleteSingleProductImage = async (req, res, next)=>{
    console.log('heelloo image delete');
    
    try {
        const {imageNameToServer, productIdToServer}=req.body;
        // remove image
        const product = await Product.findByIdAndUpdate(productIdToServer,{$pull: {productImage: imageNameToServer}});
        const imagePath = path.join('public','uploads', 're-image', imageNameToServer);

        if(fs.existsSync(imagePath)){
            await fs.unlinkSync(imagePath);
            console.log(`Image ${imageNameToServer}deleted successfully`);
            
        }else{
            console.log(`Image ${imageNameToServer} not found`);
            
        }
        res.send({status: true});
    } catch (error) {
        console.error('Error occured while deleting image',error.message)
        
    }
}