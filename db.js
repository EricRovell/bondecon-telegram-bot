import mongo from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const { MongoClient, ObjectID } = mongo;

class DBClient {
  constructor({ url, dbName }) {
    this.client = new MongoClient(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    this.dbName = dbName;
    this.db = null;

    this.connect();
  }

  async connect() {
    try {
      if (this.db) {
        return this.db;
      }      
      const client = await this.client.connect();
      this.db = client.db(this.dbName);
      return this.db;

    } catch (error) {
      return error;
    }
  }
}

export { DBClient as DBClient};
export { ObjectID as ObjectID };
