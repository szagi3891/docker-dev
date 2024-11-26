
import { MongoClient } from "mongodb";

async function watchInplayAndTypeDocuments() {
  
  //Dns z docker-composer
//   const uri = "mongodb://0.0.0.0:27017?replicaSet=mongo-repl"; // Connection string
  const uri = "mongodb://127.0.0.1:27017/testdb?replicaSet=rs0";
  // const uri = "mongodb://localhost:27017"; // Connection string
  const client = new MongoClient(uri);

  try {
    console.info('connect1');
    await client.connect();
    console.info('connect2');
    const db = client.db("testdb"); // Podmień na nazwę bazy danych
    const collection = db.collection("collection1"); // Podmień na nazwę kolekcji

    console.info('connect3');

    // const pipeline = [
    //     {
    //         $match: {
    //             operationType: { $in: ["insert", "update"] },
    //             "fullDocument.status": "inplay", // Filtrowanie na "inplay"
    //             "fullDocument.typem": "specificType", // Filtrowanie na konkretny typ
    //         },
    //     },
    // ];

    // console.log("Listening for changes...");
    // const changeStream = collection.watch(pipeline, { fullDocument: "updateLookup" });
    // changeStream.on("change", (change) => {
    //   console.log("Znaleziono zmianę:", change);
    // });





    
    const changeStream = collection.watch([], { fullDocument: "updateLookup" });

    changeStream.on("change", (change) => {
      console.log("Zmiana:", change);
    });
    
    //   const fullDocument = change.fullDocument;
    
    //   if (
    //     fullDocument &&
    //     fullDocument.status === "inplay" &&
    //     fullDocument.typem === "specificType"
    //   ) {
    //     console.log("Pasująca zmiana:", fullDocument);
    //     // Tutaj dodaj kod przetwarzania
    //   }


    
    // (async () => {
    //   const aaa = await collection.insertOne({
    //     status: "inplay",
    //     typem: "specificType"
    //   });

    //   console.info('aaa', aaa);

    //   const bbb = await collection.insertOne({
    //     status: "inplay",
    //     typem: "specificType222"
    //   });

    //   console.info('bbb', bbb);
    // })();

    // setTimeout(async () => {
    //   await changeStream.close();
    // //   await client.close();
    // }, 3_000);
  
    process.on("SIGINT", async () => {
      console.log("Zamykanie połączenia...");
      await changeStream.close();
      await client.close();
      process.exit(0);
    });
  } catch (error) {
    console.error("Błąd:", error);
  }
}




    // const changeStream = collection.watch(pipeline);

    // for await (const message of changeStream) {

    // }

    
console.info('server');


// await initializeReplicaSet();

console.info('step1');

await watchInplayAndTypeDocuments();

console.info('end');

// console.info('step2');

// await find();