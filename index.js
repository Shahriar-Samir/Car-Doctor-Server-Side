const express = require('express')

const app = express()
const port = process.env.PORT || 5000


app.get('/', (req,res)=>{
        res.send("Car Doctor Server Side")
})

app.listen(()=>{
    console.log(`listening on port ${port}`)
})