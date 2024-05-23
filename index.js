const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000
require('dotenv').config()
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

app.use(cors({
    origin: [ 'http://localhost:5173','https://my-web-projects-d89ff.web.app','https://my-web-projects-d89ff.firebaseapp.com'],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

const secure  = (req,res,next)=>{
      const token = req.cookies.jwt
      if(!token){
        return res.status(401).send('not authorized')
      }
      else{
        jwt.verify(token, process.env.SECRET, (err,decoded)=>{
            if(err){
                return res.status(401).send('not authorized')
            }
            req.user = decoded
            next()
        })
      }
}


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@database1.g36ghl5.mongodb.net/?retryWrites=true&w=majority&appName=database1`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();



  

    app.post('/jwt',async(req,res)=>{
        const data = req.body
        const token = jwt.sign(data,process.env.SECRET, {expiresIn: '1h'})
        res.cookie('jwt', token, {httpOnly:true, sameSite: 'none', secure:true })
        .send()
    })
    app.post('/logout',async(req,res)=>{
        const user = req.body 
        res
        .clearCookie('jwt', {maxAge: 0, httpOnly: true,secure: true, sameSite: 'none'})
        .send()
    })

    app.get('/', (req,res)=>{
        res.send("Car Doctor Server Side")
    })

    const serviceCollection = client.db('Car_Doctor').collection('Services')
    const orderCollection = client.db('Car_Doctor').collection('Orders')

    app.get('/services',async (req,res)=>{
        const result = await serviceCollection.find().toArray()
        res.send(result)
    })

    app.get('/orders',async (req,res)=>{
        const result = await orderCollection.find().toArray()
        res.send(result)
    })
    app.get('/myOrders', secure ,async (req,res)=>{
        const {email} = req.query
        if(email === req.user.email){
          const result = await orderCollection.find({email}).toArray()
           return res.send(result)
        }
        else{
           return  res.status(403).send('Forbidden')
        }
    })

    app.get('/services/:id',async (req,res)=>{
        const {id}= req.params
        const query = {_id: new ObjectId(id)}
        const options = {
            projection:{title:1,service_id:1, price:1,img:1}
        }
        const result = await serviceCollection.findOne(query,options)
        res.send(result)
    })

    app.post('/bookOrder',async (req,res)=>{
        const data = req.body
        const result = await orderCollection.insertOne(data)
        res.send(result)
    })

    app.delete('/deleteBooking',async (req,res)=>{
        const {email,_id} = req.query
        const result = await orderCollection.deleteOne({email,_id: new ObjectId(_id)})
        res.send(result)
    })



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port,()=>{
    console.log(`listening on port ${port}`)
})