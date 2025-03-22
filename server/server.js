const express = require('express');
const app = express();

app.use(express.json());

app.get('/', function (req,res) {
    res.send('Server is running');
})

const PORT = 3000

app.listen(PORT, function () {
    console.log(`Server is listening on PORT ${PORT}`);
})