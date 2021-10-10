const {Product }=require('../models/products')
const express=require('express')
const { Category } = require('../models/category')
// const { Product } = require('../models/products')
const router=express.Router()
const mongoose=require('mongoose')
const multer=require('multer')
const e = require('express')

const FILE_TYPE_MAP={
    'image/png':'png',
    'image/jpg':'jpg',
    'image/jpeg':'jpeg',
    'image/svg':'svg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid=FILE_TYPE_MAP[file.mimetype]
        let uploadError=new Error('Invalid image type')
        if(isValid){
            uploadError=null
        }
      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
   
      const fileName=file.originalname.split(' ').join('-')
      const extension=FILE_TYPE_MAP[file.mimetype]

      cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
  })
  
  const uploadOptions = multer({ storage: storage })

router.get(`/`,async (req,res)=>{
    let filter={}
    if(req.query.categories){
         filter={category:req.query.categories.split(',')  }
    }
    const productList=await Product.find(filter).populate('category')
    if(!productList){
        res.status(500).json({success:false})
    }
    res.send(productList)
    // res.send('hello api !')
})

router.get(`/:id`,async (req,res)=>{
    const productList=await Product.findById(req.params.id).populate('category')
    if(!productList){
        res.status(500).json({success:false})
    }
    res.send(productList)
    // res.send('hello api !')
})


router.post(`/`,uploadOptions.single('image'),async(req,res)=>{
    const category=await Category.findById(req.body.category)
    if(!category) return res.status(400).send('invalid category')

    const file=req.file
    if(!file) return res.status(400).send('no image')

    const fileName=req.file.filename
    const basePath=`${req.protocol}://${req.get('host')}/public/uploads/`

     let product=new Product({
       name:req.body.name,
       description:req.body.description,
       richDescription:req.body.richDescription,
       image:`${basePath}${fileName}`,
       brand:req.body.brand,
       price:req.body.price,
       category:req.body.category,
       countInStock:req.body.countInStock,
       rating:req.body.rating,
       numReviews:req.body.numReviews,
       isFeatured:req.body.isFeatured,


   })

   product=await product.save()
   if(!product)
   return res.status(500).send('The product cannot be created')

   res.send(product)
   
})

router.put('/:id',uploadOptions.single('image'),async(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('invalid category')
    }

    const category=await Category.findById(req.body.category)
    if(!category) return res.status(400).send('invalid category')

    const file=req.file
    let imagePath

    if(file){
        
    const fileName=req.file.filename
    const basePath=`${req.protocol}://${req.get('host')}/public/uploads/`
    imagePath=`${basePath}${fileName}`
    }
    else{
        imagePath=product.image
    }

    let product=await Product.findByIdAndUpdate(
        req.params.id,{
        name:req.body.name,
        description:req.body.description,
        richDescription:req.body.richDescription,
        image:`${imagePath}`,
        brand:req.body.brand,
        price:req.body.price,
        category:req.body.category,
        countInStock:req.body.countInStock,
        rating:req.body.rating,
        numReviews:req.body.numReviews,
        isFeatured:req.body.isFeatured,
    },{
        new:true
    }
    )

 
    // product=await product.save()
    if(!product)
    return res.status(500).send('The product cannot be updated')
 
    res.send(product)
    
 })


 router.put('/gallery-images/:id',uploadOptions.array('images',10),async(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('invalid category')
    }

    const files=req.files
    let imagesPath=[]
    const basePath=`${req.protocol}://${req.get('host')}/public/uploads/`

    if(files){
        files.map(file=>{
            imagesPath.push(`${basePath}${file.fileName}`)
        })
    }


    const product=await Product.findByIdAndUpdate(
        req.params.id,{
       images:imagesPath
    },{
        new:true
    }
    )

    if(!product)
    return res.status(500).send('The product cannot be updated')
 
    res.send(product)
 })


 router.delete('/:id',async(req,res)=>{

    Product.findByIdAndRemove(req.params.id).then(product=>{
        if(product){
            return res.status(200).json({success:true,message:'delete like v bro yay'})
        }else{
            return res.status(404).json({success:false,message:"ma twae buu tk"})
        }

    }).catch(err=>{
        return res.status(400).json({success:false,error:err})
    })
 })

 router.get('/get/count',async(req,res)=>{
    const productCount=await Product.countDocuments()
    if(!productCount){
        res.status(500).json({success:false})
    }
    res.send({
        productCount:productCount
    })
 })

 router.get('/get/featured/:count',async(req,res)=>{
    const count=req.params.count ? req.params.count: 0
    const products=await Product.find({
        isFeatured:true
    }).limit(+count)
    if(!products){
        res.status(500).json({success:false})
    }
    res.send(products)
 })
module.exports=router