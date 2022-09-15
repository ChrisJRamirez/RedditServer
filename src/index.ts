import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { _prod_ } from "./constants";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UsersResolver } from "./resolvers/users";

import connectRedis from "connect-redis";
import * as redis from "redis"; // * as to fix error "Cannot read property 'createClient' of undefined"
import session from "express-session";
import { MyContext } from "./types";
import cors from "cors";
import { InMemoryLRUCache } from "@apollo/utils.keyvaluecache";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();
  // const fork = orm.em.fork();

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient({
    legacyMode: true,
  });
  await redisClient.connect();

  app.use(
    cors({
      origin: ["http://localhost:3000", "https://studio.apollographql.com"],
      credentials: true,
    })
  );

  app.use(
    session({
      name: "qid",
      store: new RedisStore({
        client: redisClient as any, // as any added to fix error "The expected type comes from property 'client' which is declared here on type 'RedisStoreOptions'"
        disableTouch: true, // keeps redis session forever in order to make fwer requests
      }),
      cookie: {
        maxAge: 100000000000000000000000000000000, // 10 years
        httpOnly: true,
        sameSite: "lax", // protecting crsf
        secure: _prod_, // cookie only works in https if true
      },
      secret: "adsfghjffjjhfjf", // make this an environment variable
      resave: true, // was false, fliped to true cuz of error "express-session deprecated undefined saveUninitialized option; provide saveUninitialized option dist/index.js:57:43"
      saveUninitialized: false, // on true it is storing empty sessions
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UsersResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em.fork(), req, res }),
    cache: new InMemoryLRUCache({
      maxSize: Math.pow(5, 20) * 100,
    }),
  });
  // You must `await server.start()` before calling `server.applyMiddleware()` *** had to add in line below **
  await apolloServer.start();
  // Access to fetch at 'http://localhost:4000/graphql' from origin 'http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.
  // can fix above error by replacing "*" with desired origin, in this case localhost:3000 in cors above, and/or make it false in middleware
  apolloServer.applyMiddleware({
    app,
    cors: false,
    //   {
    //     origin: "http://localhost:3000",
    //     credentials: true,
    // }
  });

  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });

  // const post = fork.create(Post, {
  //   title: "my first pet",
  //   createdAt: new Date(),
  //   updatedAt: new Date(),
  // });

  // const posts = await fork.find(Post, {});
  // console.log(posts)
};

main();
