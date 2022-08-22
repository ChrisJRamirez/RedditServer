import { Users } from "../entities/Users";
import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";

// another way of creating input fields
@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Users, { nullable: true })
  users?: Users;
}

//REGISTER
@Resolver()
export class UsersResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    // username length errors
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "length must be greater than 2",
          },
        ],
      };
    }
    //password length errors
    if (options.password.length <= 3) {
      return {
        errors: [
          {
            field: "password",
            message: "length must be greater than 3",
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(options.password);
    const users = em.create(Users, {
      username: options.username,
      password: hashedPassword,
    });
    try {
      await em.persistAndFlush(users);
    } catch (err) {
      // duplicate username error
      if (err.code === "23505") {
        // || err.detail.includes("already exists")=> goes in parentheses
        return {
          errors: [
            {
              field: "username",
              message: "username already taken", // should just say invalid login}
            },
          ],
        };
      }
    }
    //need to return users in an object because we have a response object ****
    return { users };
  }

  // LOGIN
  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const users = await em.findOne(Users, {
      username: options.username.toLowerCase(),
    });
    if (!users) {
      return {
        errors: [
          {
            field: "username",
            message: "that username doesn't exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(users.password, options.password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "invalid login",
          },
        ],
      };
    }

    req.session.usersId = users.id

    return { users };
  }
}
