import { Args, Field, ID, ObjectType, Query, Resolver } from "@nestjs/graphql";
import { BrandService } from "./brand.service";

@ObjectType()
class BrandObject {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  slug?: string;

  @Field()
  image: string;
}

@Resolver(() => BrandObject)
export class BrandResolver {
  constructor(private readonly brandService: BrandService) {}

  @Query(() => [BrandObject], { name: "brands" })
  findAll() {
    return this.brandService.findAll();
  }

  @Query(() => BrandObject, { name: "brand", nullable: true })
  findOne(@Args("id", { type: () => ID }) id: string) {
    return this.brandService.findOne(id);
  }
}
