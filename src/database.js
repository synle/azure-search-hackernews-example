const CosmosClient = require("@azure/cosmos").CosmosClient;

const config = {
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_PRIM_KEY,
  databaseId: "HackerNews",
  containerId: "Articles",
  partitionKey: { kind: "Hash", paths: ["/id"] }
};

/*
// This script ensures that the database is setup and populated correctly
*/
async function create(client, databaseId, containerId) {
  const partitionKey = config.partitionKey;

  /**
   * Create the database if it does not exist
   */
  const { database } = await client.databases.createIfNotExists({
    id: databaseId
  });
  console.log(`Created database:\n${database.id}\n`);

  /**
   * Create the container if it does not exist
   */
  const { container } = await client
    .database(databaseId)
    .containers.createIfNotExists(
      { id: containerId, partitionKey },
      { offerThroughput: 400 }
    );

  console.log(`Created container:\n${container.id}\n`);
}

let client;

module.exports = {
  init: async () => {
    if(client){
      return client;
    }

    const { endpoint, key, databaseId, containerId } = config;
    client = new CosmosClient({ endpoint, key });
    await create(client, databaseId, containerId);

    const database = client.database(databaseId);
    const container = database.container(containerId);

    return {client, database, container};
  }
};
