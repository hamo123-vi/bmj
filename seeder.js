const fs = require('fs')
const dotenv = require('dotenv')
const mongoose = require('mongoose')

//Load env variables
dotenv.config( { path: './config/config.env' } )

//Load models
const Bootcamp = require('./models/Bootcamp')
const Course = require('./models/Course')
const User = require('./models/User')
const Review = require('./models/Review')

//Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
})

//Read JSON data
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'))
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'))


//Insert into DB
const insertIntoDb = async () => {
    try{
        await Bootcamp.create(bootcamps);
        await Course.create(courses);
        await User.create(users);
        await Review.create(reviews);

        console.log("Data inserted...")
        process.exit()
    }
    catch(err){
        console.log(err.message)
    }
}

//Delete from DB
const deleteFromDb = async () => {
    try{
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        
        console.log("Data destroyed...")
        process.exit()
    }
    catch(err){
        console.log(err.message)
    }
}

if(process.argv[2] === '-i') {
    insertIntoDb()
} else if (process.argv[2] === '-d') {
    deleteFromDb()
}