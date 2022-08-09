import { Post } from "../entities/Post";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { MyContext } from "src/types";

@Resolver()
export class PostResolver {
  // for arrays, the type is an array [] of Post(s)
  // R of CRUD
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    // destructing ctx.em ^
    return em.find(Post, {});
  }

  // R by id of CRUD
  @Query(() => Post, { nullable: true })
  post(
    // "id" becomes name of field in schema in GraphQL, could be "identifier"
    @Arg("id", () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    return em.findOne(Post, { id });
  }

  // C of CRUD
  // Query is for getting data, Mutation is for updating/inserting/deleting
  @Mutation(() => Post)
  async createPost(
    @Arg("title") title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post> {
    const post = em.create(Post, { title });
    await em.persistAndFlush(post);
    return post;
  }

  // U of CRUD
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id });
    if (!post) {
      return null;
    }
    if (typeof title !== "undefined") {
      post.title = title;
      await em.persistAndFlush(post);
    }
    return post;
  }

  // D of CRUD
  @Mutation(() => Boolean)
  async deletePost(
    @Arg("id") id: number,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    await em.nativeDelete(Post, { id });
    return true;
  }
}
