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

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();
  // const fork = orm.em.fork();

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    session({
      name: "qid",
      store: new RedisStore({
        client: redisClient as any, // as any added to fix error "The expected type comes from property 'client' which is declared here on type 'RedisStoreOptions'"
        disableTouch: true, // keeps redis session forever in order to make fwer requests
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax", // protecting crsf
        secure: _prod_, // cookie only works in https if true
      },
      secret: "adsfghjffjjhfjf", // make this an environment variable
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UsersResolver],
      validate: false,
    }),
    context: ({ req, res}) => ({ em: orm.em.fork(), req, res }),
  });
  // You must `await server.start()` before calling `server.applyMiddleware()` *** had to add in line below **
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

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
