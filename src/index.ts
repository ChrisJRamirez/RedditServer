import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { _prod_ } from "./constants";
import microConfig from "./mikro-orm.config";
import express from "express";
import {ApolloServer} from "apollo-server-express";
import {buildSchema} from "type-graphql"
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import {UsersResolver} from "./resolvers/users"

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();
  // const fork = orm.em.fork();

  const app = express();
  
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UsersResolver],
      validate: false
    }),
    context: () => ({em: orm.em.fork()})
  });
  // You must `await server.start()` before calling `server.applyMiddleware()` *** had to add in line below **
  await apolloServer.start();
  apolloServer.applyMiddleware({app});

  app.listen(4000, () => {
    console.log("server started on localhost:4000")
  })

  // const post = fork.create(Post, {
  //   title: "my first pet",
  //   createdAt: new Date(),
  //   updatedAt: new Date(),
  // });

  // const posts = await fork.find(Post, {});
  // console.log(posts)

  
};

main();
