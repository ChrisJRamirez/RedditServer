import { MikroORM } from "@mikro-orm/core";
import { _prod_ } from "./constants";
import { Post } from "./entities/Post";

const main = async () => {
  const orm = await MikroORM.init({
    entities: [Post],
    dbName: "lireddit",
    debug: !_prod_,
    type: "postgresql",
    password: "postgresql",
  });

  const post = orm.em.create(Post, {
    title: "my first post",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log(post)
};

main();
