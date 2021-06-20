const { MongoClient } = require("mongodb");

const data = require('./data.js');

const uri = "mongodb://127.0.0.1:27017"

async function run() {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        const database = client.db("test");
        const firstCollection = database.collection("firstCollection");
        const secondCollection = database.collection("secondCollection");
        const thirdCollection = database.collection("thirdCollection");

        // this option prevents additional documents from being inserted if one fails

        const options = { ordered: true };
        const resultOne = await firstCollection.insertMany(data.firstData, options);
        console.log(`${resultOne.insertedCount} documents were inserted`);
        const resultTwo = await secondCollection.insertMany(data.secondData, options);
        console.log(`${resultTwo.insertedCount} documents were inserted`);

        data.firstData = await firstCollection.find({}).toArray();

        for (let i = 0; i < data.firstData.length; i++) {
            await firstCollection.updateOne(
                { "_id": data.firstData[i]._id },
                {
                    $set:
                    {
                        longitude: data.firstData[i].location.ll[0],
                        latitude: data.firstData[i].location.ll[1]
                    }
                })
        }

        for (let i = 0; i < data.firstData.length; i++) {
            let current = await secondCollection.findOne(
                { "country": data.firstData[i].country })
            let diff = current.overallStudents - data.firstData[i].students.length
            await firstCollection.updateOne(
                { "_id": data.firstData[i]._id },
                {
                    $set:
                        { difference: diff }
                })
        }

        const countries = await firstCollection.distinct("country")
        const countriesCount = {}
        for (let i = 0; i < countries.length; i++) {
            let counter = await firstCollection.find({ country: countries[i] }).count();
            countriesCount[countries[i]] = counter
        }

        for (let i = 0; i < countries.length; i++) {
            let allDiffs = await firstCollection.find({ country: countries[i] }).project({ difference: 1, _id: 0 }).toArray();
            let longitude = await firstCollection.find({ country: countries[i] }).project({ longitude: 1, _id: 0 }).toArray();
            let latitude = await firstCollection.find({ country: countries[i] }).project({ latitude: 1, _id: 0 }).toArray();
            await thirdCollection.insertOne({ _id: countries[i], allDiffs, count: countriesCount[countries[i]], longitude, latitude })
        }

    } finally {
        await client.close();
    }
}
run().catch(console.dir);
