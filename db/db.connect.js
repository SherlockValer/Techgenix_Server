const mongoose = require('mongoose')
require('dotenv').config()

const techGenixUri = process.env.MONGODB

const connectDB =  async() => {
    await mongoose 
        .connect(techGenixUri, {dbName:"techgenix"})
        .then(() => {
            console.log("Connected to the database")
        })
        .catch((error) => {
            console.log("Error connecting to the database", error.message)
        })
}

module.exports = {connectDB}