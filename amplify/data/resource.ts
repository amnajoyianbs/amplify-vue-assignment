import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/**
 * Asset Management Schema
 * DynamoDB stores: tags, status, logs, and references to RDS asset metadata
 */
const schema = a.schema({
  // Complete Asset stored in DynamoDB
  Asset: a
    .model({
      name: a.string().required(),
      description: a.string(),
      category: a.string().required(),
      imageUrl: a.string(),
      userId: a.string().required(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read'])
    ]),

  // Asset additional info stored in DynamoDB
  AssetInfo: a
    .model({
      assetId: a.string().required(), // Reference to Asset
      tags: a.string().array(), // Array of tags
      status: a.enum(['active', 'inactive', 'archived']),
      notes: a.string(),
      userId: a.string().required(), // Owner of the asset
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read'])
    ]),

  // Asset activity logs stored in DynamoDB
  AssetLog: a
    .model({
      assetId: a.string().required(),
      action: a.enum(['created', 'updated', 'deleted', 'viewed']),
      timestamp: a.datetime(),
      userId: a.string().required(),
      details: a.string(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read'])
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
