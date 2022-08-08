import { Post } from "../entities/Post";
import { Ctx, Query, Resolver } from "type-graphql";
import { MyContext } from "src/types";

@Resolver()
export class PostResolver {
  // for arrays, the type is an array [] of Post(s)
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> 
  // destructing ctx.em ^
  {
    return em.find(Post, {});
  }
}
