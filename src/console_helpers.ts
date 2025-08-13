export const isString = (obj: unknown): obj is string => {
  return typeof obj === 'string';
};

export const getInput = async (debug: boolean = false): Promise<string | undefined> => {
  // const decoder = new TextDecoder();
  // for await (const chunk of Deno.stdin.readable) {
  //   const text = decoder.decode(chunk);
  //   debug && console.log(`[getInput()]:[text]=${text}`);
  //   return text.trim();
  // }
  const buffer = new Uint8Array(1024); // does this blow out?
  const n = await Deno.stdin.read(buffer);
  if (n === null) return undefined;

  const text = new TextDecoder().decode(buffer.subarray(0, n));
  debug && console.log(`[getInput()]:[text]=${text}`);
  return text.trim();
};

/**


// Not just foreground, but also background colors can be set.
console.log("%cHello World", "background-color: blue");
console.log("Wild %cblue", "color: blue", "yonder"); // Applies a blue text color to the word "blue"
console.log("%cNamed Color: lime", "color: lime;");
console.log("%cRGB Green: rgb(0, 255, 0)", "color: rgb(0, 255, 0);");

const people = {
  "john": {
    "age": 30,
    "city": "New York",
  },
  "jane": {
    "age": 25,
    "city": "Los Angeles",
  },
};

console.table(people);
console.log("%cHello, Deno!", "color: #00FFFF;");
console.log("%cHello, Deno!", "color: cyan;");




 */
