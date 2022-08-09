import { Post } from "./entities/Post";
import { _password_, _prod_ } from "./constants";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { Users } from "./entities/Users";

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post, Users],
  dbName: "lireddit",
  debug: !_prod_,
  type: "postgresql",
  password: _password_,
  allowGlobalContext: false,
} as Parameters<typeof MikroORM.init>[0];
