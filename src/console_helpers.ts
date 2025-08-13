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
  const BUFFER_SIZE = 1024;
  const buffer = new Uint8Array(BUFFER_SIZE); // this will truncate input longer than BUFFER_SIZE
  const n = await Deno.stdin.read(buffer);
  if (n === null) return undefined;
  if (n === BUFFER_SIZE) {
    throw new Error(`Input too long, max ${BUFFER_SIZE} bytes`);
  }

  const text = new TextDecoder().decode(buffer.subarray(0, n));
  debug && console.log(`[getInput()]:[text]=${text}`);
  debug && console.log(`[getInput()]:[n]=${n}`);

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
