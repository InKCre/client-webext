// index of relation module

export class Relation {
  constructor(
    public from_: number,
    public to_: number,
    public content: string,
    public id?: number,
    public updated_at?: Date
  ) {}
}

export class RelationForm {
  constructor(
    public content: string,
    public from_?: number,
    public to_?: number
  ) {}
}
