import { Character } from "../models/character.model";

export default class CharacterSvc {
  constructor(private character: Character) {}

  create(name: string) {
    return this.character.create({
      name
    });
  }
}