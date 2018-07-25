import * as awilix from "awilix";

// Create the container and set the injectionMode to PROXY (which is also the default).
export const container = awilix.createContainer({
  injectionMode: awilix.InjectionMode.PROXY
})
