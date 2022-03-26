const express = require('express')
const mongoose = require("mongoose")
const router = express.Router()
const createError = require('http-errors')
const User = require('../Models/User.model')
const { schema } = require('../helpers/validation_schema')
const { authSchema } = require('../helpers/validate_login')
// const { signAccessToken } = require('../helpers/jwt_helper')
const multer = require("multer")
const path = require("path")
const date = require("date-and-time")
// const { now } = require("mongoose")

const cloudinary = require("cloudinary")


const UserPost = require("../Models/userposts")
const { route } = require('express/lib/application')
const userposts = require('../Models/userposts')

const {signAccessToken} = require("../helpers/jwt_authentication")



router.post('/userDetails', async(req, res, next) => {
    try {
        const userid = mongoose.Types.ObjectId(req.body.userid)
        const result =await User.findOne({_id:userid})
        res.send(result)
        // res.send(req.body.userid)
    } catch (error) {
        next(error)
    }
})


router.post('/register', async(req, res, next) => {
    try {
        const result = await schema.validateAsync(req.body)
        
        const doesExist = await User.findOne({email : result.email})
        if(doesExist)
            throw createError.Conflict(`${result.email} is already been Registerd`)
        
        const user = new User(result)
        const saveUser = await user.save()
        // res.send(saveUser)
        const accessToken  = await signAccessToken(saveUser.id)
        res.send(accessToken)

    } catch (error) {
        if(error.isJoi === true) error.status = 422
        next(error)
    }
})

router.post('/login', async(req, res, next) => {
    try {
        const result = await authSchema.validateAsync(req.body)
        
        const user = await User.findOne({email : result.email}) //check email
        if(!user) throw createError.NotFound("User Not Found")

        const isMatch = await  user.isValidPassword(result.password) //check password
        if(!isMatch) throw createError.Unauthorized("Invalid UserName/Password")

        const accessToken = await signAccessToken(user.id);
        res.send(accessToken);
        // res.send(user)

        // const accessToken = await signAccessToken(user.id)


        // res.send({ accessToken })

    } catch (error) {
        if (error.isJoi == true) return next(createError.BadRequest("Invlid UserName/Password"))
        next(error)
    }
})

router.post('/logout', async(req, res, next) => {
    res.send("Logout Success")
})

router.post('/refresh-token', async(req, res, next) => {
    res.send("Refresh-token Success")
})




// Uploading an image

// const storage=multer.diskStorage({
//     destination: "../assets/posts",
//     filename:(req,file,cb)=>{
//         return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
//     }
// })

// const upload=multer({
//     storage:storage,
// })


// router.post('/post',upload.single("post"),(req,res)=>{
//     try {
//         // console.log(req.file)

         
//         const result = new UserPost({
//             // title:req.body.title,
//             // postdate:date.format(new Date(), 'YYYY/MM/DD HH:mm:ss'),
//             image:req.file.filename
//         })

//         result.save()

//     } catch (error) {
//         console.log(error)
//     }
// })

//image upload

// router.post('/image-upload', async(req, res, next) => {
//     const result =  new UserPost(req.body)
//     const saveimage = new UserPost(result)
//     await saveimage.save()
//     res.send(saveimage)
// })


// Uploading post with an image


cloudinary.config({
    cloud_name: "dyfrwtfyi",
    api_key: "484936793823554",
    api_secret: "a9DLpoYDVTTyw5XKtL-nYRF7T9I"
})


const storage = multer.diskStorage({
    // destination:'./upload',
    filename:(req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({
    storage:storage,
    
    
})

router.post('/post',upload.single('image'),async(req, res, next)=>{
    try {
    //     console.log("Image Uploaded Successfully..")
    // console.log(req.file.filename)
    // console.log(date.format(new Date(),'YYYY/MM/DD HH:mm:ss'))
        
    const cloud_img = await cloudinary.uploader.upload(req.file.path)
    
    const post = new UserPost({
        category:req.body.category,
        tag:req.body.tag,
        postdate:date.format(new Date(),'YYYY/MM/DD'),
        // postdate:date.format(new Date(),'2022/03/13'),
        posttime:date.format(new Date(),'HH:mm:ss'),
        image:req.file.filename,
        image_url:cloud_img.secure_url,
        cloud_id:cloud_img.public_id

    })
    console.log(cloud_img)
    const result = await post.save()
    res.send(result)
    console.log(result)
    // if(res)
    // {
    //     console.log("Inserted....")
        
    // }

    // console.log(req.body.title)
    // res.json(req.body)
    

    } catch (error) {
        next(error)
    }
})

//all images and details

router.get('/all-images', async(req, res, next) => {
    try {
        const results = await UserPost.find({}, {__v: 0})
        res.send(results)
    } catch (error) {
        next(error)
    }
})


router.get('/same-category', async(req, res, next) => {
    try {
            const category = await UserPost.distinct('category')
            res.send(category)
    } catch (error) {
        next(error)
    }
})

// search same category

router.post('/search-category', async(req, res, next)=>{
    try {
        const result = await UserPost.find({category: req.body.category})
        res.send(result)
    } catch (error) {
        next(error)
    }
})


// fetch all images category wise
router.post('/category-wise-images',async (req,res,next)=>{
    const cat = UserPost(req.body)
    const result=await UserPost.find({category:cat.category},{__v:0})
    res.send(result)
    
})

// fetch image by tag name

router.post('/search-by-tag', async(req, res, next) => {
   try {
    const result = await UserPost.find({tag : req.body.tag})
    res.json(result)
    
   } catch (error) {
       next(error)
   }
})

//fetching thumbnail image by category
router.post('/thumbnail-category', async(req, res, next) => {
    const cat = UserPost(req.body)
    var sort = {posttime : -1}
    const imgurl = await UserPost.find({category: cat.category}, {image_url:1, _id: 0}).limit(1).sort(sort)
    const result = imgurl[0].image_url
    res.send(result)
})


// deleting images

router.delete('/:id', async(req, res, next) =>{
    try {
        id = req.params.id 
        const result = await UserPost.findById(id)
        //delete image from cloudinary
        await cloudinary.uploader.destroy(result.cloud_id)
        //deleting user from mongoDb
        await result.remove()
        res.send("Deleted")

    } catch (error) {
        next(error)
    }
})



router.get("/categoryDates", async(req, res, next)=>{
    // const dates = UserPost.find().distinct("")
    // const now  =  new Date();
    // const value = date.format(now,'YYYY/MM/DD');
    // const value1 = date.format(now,'HH:mm:ss')
    // res.send("Date :"+value1)*
})


// distinct date wise date

router.post('/distinct-date', async(req, res, next)=>{
    try {
        const result = await UserPost.find({category: req.body.category}).sort({postdate : -1}).distinct('postdate')
        
        res.send(result)
    } catch (error) {
        next(error)
    }
})

// // fetch dates category wise

// router.post('/date-wise-images', async(req, res, next) => {
//     const result = await UserPost.find({postdate : req.body.postdate, category : req.body.category})
//     hash = result.reduce((p,c) => (p[c.postdate] ? p[c.postdate].push(c) : p[c.postdate] = [c], p), {})
//     newData = Object.keys(hash).map(k => ({
//         postdate: k,
//         category: hash[k]
//     }))  
//     res.send(newData)
// })

router.post('/date-wise-images', async(req, res, next) => {
    const result = await UserPost.find({postdate : req.body.postdate, category : req.body.category})
    res.send(result)
})


module.exports = router