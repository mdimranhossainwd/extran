const express = require("express");
require("dotenv").config();

const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      // "https://group-studies-fc547.firebaseapp.com/",
      "https://versed-feather.surge.sh/",
      "http://localhost:5173",
    ],

    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_ONLINE_USER}:${process.env.DB_ONLINE_PASSWORD}@cluster0.2xcsswz.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const featuresCollections = client.db("OnlineDB").collection("features");
    const assainmentCollections = client
      .db("OnlineDB")
      .collection("createassainment");
    const myAssainmentCollections = client
      .db("OnlineDB")
      .collection("myassainments");

    // const gateman = (req, res, next) => {
    //   const { token } = req.cookies;
    //   if (!token) {
    //     return res.status(401).send({ message: `Your Aren't Authorize !!` });
    //   }
    //   jwt.verify(token, secret, function (err, decoded) {
    //     if (err) {
    //       return res.status(401).send({ message: `Your Aren't Authorize !!` });
    //     }
    //     req.user = decoded;
    //     next();
    //   });
    // };

    // GET DTA FORM FEATURES
    app.get("/features", async (req, res) => {
      const cursor = await featuresCollections.find().toArray();
      res.send(cursor);
    });

    app.delete("/myassainments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await myAssainmentCollections.deleteOne(query);
      res.send(result);
    });

    app.post("/my-assainments", async (req, res) => {
      const body = req.body;
      const result = await myAssainmentCollections.insertOne(body);
      res.send(result);
    });

    app.get("/myassainments", async (req, res) => {
      const cursor = await myAssainmentCollections.find().toArray();
      res.send(cursor);
    });

    // POST DATA
    app.post("/assainment-collections", async (req, res) => {
      const body = req.body;
      const getCollection = await assainmentCollections.insertOne(body);
      res.send(getCollection);
    });

    // GET DATA
    app.get("/assainment-collections", async (req, res) => {
      const cursor = await assainmentCollections.find().toArray();
      res.send(cursor);
    });

    app.put("/createassainment/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateAssainment = req.body;
      const updateForm = {
        $set: {
          name: updateAssainment.name,
          email: updateAssainment.email,
          marks: updateAssainment.marks,
          img: updateAssainment.img,
          date: updateAssainment.date,
          details: updateAssainment.details,
        },
      };
      const result = await assainmentCollections.updateOne(
        filter,
        updateForm,
        options
      );
      res.send(result);
    });

    app.get("/createassainment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assainmentCollections.findOne(query);
      res.send(result);
    });

    // DELETE DATA
    app.delete("/delete-collections/:collectionId", async (req, res) => {
      const id = req.params.collectionId;
      const query = { _id: new ObjectId(id) };
      const result = await assainmentCollections.deleteOne(query);
      res.send(result);
    });

    // JWT POST
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1hr",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
          sameSite: "none",

          // httpOnly: true,
          // secure: process.env.NODE_ENV === "production",
          // sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Assainment Server is Running !!!!!");
});

app.listen(port, () => {
  console.log(`Port Assainment is Running on :- ${port}`);
});
