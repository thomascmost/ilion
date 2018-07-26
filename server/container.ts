import * as awilix from "awilix";

import { Character } from "./models/character.model";
import { Project } from "./models/project.model";
import { User } from "./models/user.model";

import CharacterSvc from "./services/character.svc";

// Create the container and set the injectionMode to PROXY (which is also the default).
export const container = awilix.createContainer({
  injectionMode: awilix.InjectionMode.PROXY
})

container.register({
  character: awilix.asClass(Character),
  project: awilix.asClass(Project),
  user: awilix.asClass(User),
})

container.register({
  characterSvc: awilix.asClass(CharacterSvc)
})