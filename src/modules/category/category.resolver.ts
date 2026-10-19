import {
  Args,
  Field,
  ID,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { Types } from "mongoose";
import { CategoryService } from "./category.service";

@ObjectType()
class CategoryObject {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  image: string;

  @Field(() => [ID], { nullable: true })
  brands?: string[];
}

@Resolver(() => CategoryObject)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @Query(() => [CategoryObject], { name: "categories" })
  findAll() {
    return this.categoryService.findAll();
  }

  @Query(() => CategoryObject, { name: "category", nullable: true })
  findOne(@Args("id", { type: () => ID }) id: string) {
    return this.categoryService.findOne(id);
  }

  @ResolveField(() => [ID], { nullable: true })
  brands(@Parent() category: { brands?: Types.ObjectId[] }) {
    return category.brands?.map((brand) => brand.toString());
  }
}
