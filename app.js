const express=require('express')
const app=express()
const bodyParser=require('body-parser')
const morgan=require('morgan')
const mongoose=require('mongoose')
const cors=require('cors')
const authJwt = require('./helpers/jwt')
const errorHandler = require('./helpers/error-handler')

app.use(cors())
app.options('*',cors())

require('dotenv/config')

const api=process.env.API_URL


//Middleware
app.use(express.json())
app.use(morgan('tiny'))
app.use(authJwt())
app.use('/public/uploads',express.static(__dirname+'/public/uploads'))
app.use(errorHandler)

//routers
const productsRouter=require('./routes/products')
const usersRouter=require('./routes/user')
const ordersRouter=require('./routes/orders')
const categorysRouter=require('./routes/category')




app.use(`${api}/products`,productsRouter)
app.use(`${api}/users`,usersRouter)
app.use(`${api}/orders`,ordersRouter)
app.use(`${api}/categorys`,categorysRouter)





mongoose.connect(process.env.CONNECTION,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    dbName:'eshop-database'
})
         .then(()=>{
             console.log('database is good bro')
         })
         .catch((err)=>{
             console.log(err)
         })

// app.listen(3000,()=>{
//     console.log(api)
//     console.log("inn")
// })


//production
var server=app.listen(process.env.PORT || 3000,function(){
    var port=server.address().port
    console.log("Express is working on port " + port)
})