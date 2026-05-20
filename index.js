const express = require('express')
const dotenv = require('dotenv')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
dotenv.config();
const app = express()
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 8000


const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        await client.connect();
        // await client.db("admin").command({ ping: 1 });

        const db = client.db('studynook-db');
        const roomsCollection = db.collection('rooms');

        app.get('/all-rooms', async (req, res) => {
            const cursor = roomsCollection.find();
            const result = await cursor.toArray();
            res.send(result)

        })

        app.get('/all-rooms/:roomId', async (req, res) => {
            const { roomId } = req.params;
            const query = { _id: new ObjectId(roomId) }
            const result = await roomsCollection.findOne(query);
            res.send(result)
        })

        app.get('/featured-rooms', async (req, res) => {
            const cursor = roomsCollection.find().sort({ _id: -1 }).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/add-room', async (req, res) => {
            try {
                const roomData = req.body;
                // console.log('Received Room Data:', roomData);

                const result = await roomsCollection.insertOne(roomData);
                res.status(201).json(result);
            } catch (error) {
                console.error("Database Insert Error:", error);
                res.status(500).json({ error: "Failed to insert room data" });
            }
        });

        app.get('/my-listings', async (req, res) => {
            try {
                const email = req.query.email;
                const query = { userEmail: email };
                const result = await roomsCollection.find(query).toArray();
                res.send(result);
            } catch (error) {
                console.error("Error fetching rooms:", error);
                res.status(500).send({ error: "Failed to fetch rooms" });
            }
        });


        app.delete('/all-rooms/:id', async (req, res) => {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await roomsCollection.deleteOne(query);
                res.send(result);
        });



        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello World! Hello World! Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})


