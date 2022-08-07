import { MikroORM } from "@mikro-orm/core";
import { _prod_ } from "./constants";
import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";

const main = async () => {
  const orm = await MikroORM.init(microConfig);

  const fork = orm.em.fork();

  const post = fork.create(Post, {
    title: "my first post",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await orm.em.persistAndFlush(post);

  console.log(post);
};

main();
