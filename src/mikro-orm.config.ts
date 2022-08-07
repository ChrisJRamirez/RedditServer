import { Post } from "./entities/Post";
import { _prod_ } from "./constants";
import { MikroORM } from "@mikro-orm/core";

export default {
  entities: [Post],
    dbName: "lireddit",
    debug: !_prod_,
    type: "postgresql",
    // password: "postgresql",
} as Parameters<typeof MikroORM.init>[0];