const { string } = require("@hapi/joi")
const mongoose = require("mongoose")
const UserPost = mongoose.Schema({
    tag : {
        type : String
    },
    postdate : {
        type : String
    },
    posttime : {
        type : String
    },
    image:{
        type:String
    },
    category : {
        type : String,
        lowercase : true,
    },
    image_url : {
        type : String
    },
    cloud_id : {
        type : String
    }
})

module.exports=mongoose.model("userpost",UserPost)