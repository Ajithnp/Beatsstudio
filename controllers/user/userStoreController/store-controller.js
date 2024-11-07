const Product = require('../../../models/product-model')
const Brand = require('../../../models/brand-model')
const Category = require('../../../models/category-model')
const User = require('../../../models/user-model')


 
exports.getStorePage = async (req, res, next)=>{

    try {

        const user = req.session.user

        const [categories, brands] = await Promise.all ([
            Category.find({ isListed: false }),
            Brand.find({ isBlocked: false })
        ])

        let productData = (await Product.find(
            {isBlocked: false,
                category:{$in:categories.map(category=>category._id)},
                brand:{$in: brands.map(brand=>brand._id)},
                quantity:{$gt:0}
            }
        )).slice(0,16)
        
        const userDate = user ? await User.findById(user.id) : null;
        console.log('userdata or null', userDate);
        

        return res.status(200).render('user/store-page',{
            user: userDate,
            products: productData
        });

    } catch (error) {
        console.error('Error occured while loading store page',error)
        next(error)
        
    }
}