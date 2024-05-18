const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000
require('dotenv').config()

app.use(cors())
app.use(express.json())

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
    app.get('/myOrders',async (req,res)=>{
        const {email} = req.query
        const result = await orderCollection.find({email}).toArray()
        res.send(result)
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
    await client.db("admin").command({ ping: 1 });
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