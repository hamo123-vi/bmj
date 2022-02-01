//Import dependencies
const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const logger = require('morgan')
const mongoSanitizer = require('express-mongo-sanitize')
const helmet = require('helmet')
const xssCleaner = require('xss-clean')
const rateLimiter = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const errorHandler = require('./middleware/error')
const connectDB = require('./config/db')

//Load env variables
dotenv.config({ path : './config/config.env'})

//Load routes
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

//Initializing app
const app = express()

//Connect to database
connectDB()

//Body parser
app.use(express.json())

//Cookie parser
app.use(cookieParser())

//Conditionally calling middleware
if(process.env.NODE_ENV === 'development')
{
    app.use(logger())
}

//File upload
app.use(fileUpload());

//Sanitize data
app.use(mongoSanitizer());

//Prevent XSS
app.use(xssCleaner());

//Limit requests to 100 per 10 minutes
const limiter = rateLimiter({
    windowMs : 10 * 60 * 1000,
    max: 100
});

app.use(limiter);

//Prevent HPP polution
app.use(hpp());

//Enable CORS
app.use(cors());

//Make 'public' folder static
app.use(express.static(path.join(__dirname, 'public')))

//Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

//Error handler
app.use(errorHandler)

//Create Express server
const PORT = process.env.PORT;
const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode in port ${PORT}`))

//Handle unhandled rejection
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`)
    //Close server and exit process
    server.close(() => process.exit(1))
})