import { describe, expect, it } from "vitest";
import { formatKey, keyState } from "../lib/license-format";

describe("saisie de la clé d'activation", () => {
  it("met la clé en forme pendant la saisie", () => {
    expect(formatKey("lp7k3m")).toBe("LP-7K3M");
    expect(formatKey(" lp-7k3m q9xw-2h4n ")).toBe("LP-7K3M-Q9XW-2H4N");
    expect(formatKey("7K3MQ9XW2H4NZZ")).toBe("LP-7K3M-Q9XW-2H4N");
    expect(formatKey("")).toBe("");
  });
  it("reconnaît une clé complète, partielle ou impossible", () => {
    expect(keyState("")).toBe("empty");
    expect(keyState("LP-7K3M")).toBe("partial");
    expect(keyState("LP-7K3M-Q9XW-2H4N")).toBe("ok");
    expect(keyState("LP-0K3M-Q9XW-2H4N")).toBe("bad");
  });
});
