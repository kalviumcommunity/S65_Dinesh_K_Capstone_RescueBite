const express = require('express');
const dotenv = require('dotenv').config();
const userRoutes = require('./routes/user-routes');
const foodRoutes = require('./routes/food-routes');
const upload = require('./routes/upload')
const connectdatabase = require('./database/database');
const cors = require('cors');
const app = express();

app.use(express.json());

app.use(cors({
    origin: "http://localhost:3000"
}))

app.get('/', function (req,res) {
    res.send('Server is running');
})

app.use('/', userRoutes);
app.use('/food', foodRoutes);
app.use('/v1', upload )

const PORT = process.env.PORT || 4000

connectdatabase()
app.listen(PORT, function () {
    console.log(`Server is listening on PORT ${PORT}`);
})