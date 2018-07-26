import * as awilix from "awilix";
import { container } from "../container";

// Let's try with a factory function.
const makeUserService = ({ user }) => {
  // Notice how we can use destructuring
  // to access dependencies
  return {
  }
}

container.register({
  // the `userService` is resolved by
  // invoking the function.
  userService: awilix.asFunction(makeUserService)
})