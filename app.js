const axios = require("axios");
const express = require('express');
const cors = require("cors")
const redis = require("redis")

const DEFAULT_EXPIRATION = 3600; //  DEFAULT_EXPIRATION
const placeholder_url = "https://jsonplaceholder.typicode.com/photos";
const app = express();
app.use(cors());

const port = 3000;

const client = redis.createClient(); 

client.on('connect', function(){
    console.log('Connected to Redis...');
});

app.get("/", async (req, res) => {
    const key = "photos";
    client.get(key, async (error, photos) => {
        if (error) console.err(error);
        if (photos != null) { 
            console.log("# cache hit");
            return res.json((JSON.parse(photos)));
        } else {
            console.log("# cache miss");
            const albumId = req.query.albumId;
            const {data} = await axios.get(placeholder_url, {params: {albumId}});
            client.setex(key, DEFAULT_EXPIRATION, JSON.stringify(data));
            res.json(data);
        }
    })
})

app.listen(port, function(){
    console.log('Server started on port '+port);
});