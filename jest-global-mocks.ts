const mock = () => {
  let storage = {};
  return {
    getItem: key => key in storage ? storage[key] : null,
    setItem: (key, value) => storage[key] = value || "",
    removeItem: key => delete storage[key],
    clear: () => storage = {},
  };
};

/* Define an Assert function that's appropriate for Jest tests and place it on the window object. */
Object.defineProperty(window, "Assert", {value: (f: any, str: string = null) =>
   {
   if (!f)
      {
      if (str)
         str = "Assertion failed: " + str;
      else
         str = "Assertion failed.";
      console.log("\x1b[91m", str);
      expect(true).toBe(false);
      }
   }});
   
Object.defineProperty(window, "localStorage", {value: mock()});
Object.defineProperty(window, "sessionStorage", {value: mock()});
Object.defineProperty(window, "getComputedStyle", {
  value: () => ["-webkit-appearance"]
});

// Necessary for headless testing of components with angular material 
Object.defineProperty(document.body.style, "transform", {
  value: () => {
    return {
      enumerable: true,
      configurable: true
    };
  },
});