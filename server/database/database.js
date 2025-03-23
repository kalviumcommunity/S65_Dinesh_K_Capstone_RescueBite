const mongoose = require('mongoose');

const connectdatabase = async function () {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log('Database is connected');
    } catch (error) {
        console.log('Failed database connection')
        process.exit(1)
    }
}

module.exports = connectdatabase