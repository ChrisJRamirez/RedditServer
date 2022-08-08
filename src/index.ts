import { MikroORM } from "@mikro-orm/core";
import { _prod_ } from "./constants";
// import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";
import express from "express"

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();
  // const fork = orm.em.fork();

  const app = express();
  
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
