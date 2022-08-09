import { Entity, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Post {
  // from youtube comment in order to fix error "Argument of type '{ title: string; }' is not assignable to parameter of type 'RequiredEntityData<Post>" 
  [OptionalProps]?:"updatedAt"| "createdAt";
  @Field(() => Int)
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({ type: "date" })
  createdAt: Date = new Date();

  @Field(() => String)
  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Field()
  @Property({ type: "text" })
  title!: string;
}
