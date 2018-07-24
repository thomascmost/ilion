import "jest-preset-angular";
import "./jest-global-mocks";

Object.defineProperty(window, "CSS", {value: () => ({})});