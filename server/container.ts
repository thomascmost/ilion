import * as awilix from "awilix";

import Character from "./models/character.model";
import Project from "./models/project.model";
import User from "./models/user.model";

import CharacterSvc from "./services/character.svc";

// Create the container and set the injectionMode to PROXY (which is also the default).
export const container = awilix.createContainer({
  injectionMode: awilix.InjectionMode.CLASSIC
})

container.register({
  character: awilix.asValue(Character),
  project: awilix.asValue(Project),
  user: awilix.asValue(User),
})

container.register({
  characterSvc: awilix.asClass(CharacterSvc)
})