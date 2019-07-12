const express = require('express')
const TrainController = require('./TrainController')
const app = express()

app.get('/', (req, res) => {
    res.json({
        success: 0
    })
})

app.get('/train', TrainController)

app.listen(8100, console.log)