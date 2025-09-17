// (Information) Base Root module index

import { BlockForm } from "~/components/block";
import { RelationForm } from "~/components/relation";
import { inkcreApi } from "~/logic/storage";

export class ArcForm {
  constructor(
    public relation: RelationForm,
    public to_block: StarGraphForm | null = null,
    public from_block: StarGraphForm | null = null
  ) {}
}

export class StarGraphForm {
  constructor(
    public block: BlockForm,
    public out_relations: ArcForm[] = [],
    public in_relations: ArcForm[] = []
  ) {}

  create() {
    return fetch(new URL("/graph", inkcreApi.value), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        block: this.block,
        out_relations: this.out_relations,
        in_relations: this.in_relations,
      }),
    });
  }
}
