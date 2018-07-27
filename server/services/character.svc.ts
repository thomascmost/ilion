import Character from "../models/character.model";

export default class CharacterSvc {
  create(name: string) {
    return Character.create({
      name
    });
  }
}