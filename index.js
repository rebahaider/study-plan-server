const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
    origin: ['http://localhost:5173',
        "assignment-12-66ba7.web.app"],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aauiduw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

        const userCollection = client.db("studyPlatform").collection("users");
        const studyServiceCollection = client.db("studyPlatform").collection("studyServices");
        const notesCollection = client.db("studyPlatform").collection("notes");

        // users notes related api
        app.post('/notes', async (req, res) => {
            const note = req.body;
            const result = await notesCollection.insertOne(note);
            res.send(result);
        })
        app.get('/notes', async (req, res) => {
            const notes = notesCollection.find();
            const result = await notes.toArray();
            res.send(result);
        })
        app.get('/notes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await notesCollection.findOne(query);
            res.send(result);
        })
        app.patch('/notes/:id', async (req, res) => {
            const note = req.body;
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                    title: note.title,
                    description: note.description
                }
            }
            const result = await notesCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })
        app.delete('/notes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await notesCollection.deleteOne(query);
            res.send(result);
        })

        // users related api
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        })
        app.get('/users', async (req, res) => {
            const users = userCollection.find();
            const result = await users.toArray();
            res.send(result);
        })

        // get study service
        app.get('/studyServices', async (req, res) => {
            const studyService = studyServiceCollection.find();
            const result = await studyService.toArray();
            res.send(result);
        })

        app.get('/studyServices/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const studyService = await studyServiceCollection.findOne({ _id: new ObjectId(id) });
                res.send(studyService);
            } catch (error) {
                console.error('Error fetching study service by ID:', error);
                res.status(500).send({ message: 'Internal server error' });
            }
        });

        // auth related api
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res
                .cookie('token', token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'none'
                })
                .send({ success: true })
        })

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Assignment 12 is running')
})

app.listen(port, () => {
    console.log(`Assignment 12 is running on port ${port}`);
})