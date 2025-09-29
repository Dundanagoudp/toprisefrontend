import { cn } from "@/lib/utils";


// src/components/login-flow/__tests__/phone-signup-form.cn.test.ts
describe('cn() cn method', () => {
  // Happy Path Tests

  it("should concatenate two non-empty class names (happy path)", () => {
    // Test: Concatenates two non-empty strings with a space
    const result = cn("foo", "bar");
    expect(result).toBe("foo bar");
  });

  it("should concatenate multiple non-empty class names (happy path)", () => {
    // Test: Concatenates three non-empty strings with spaces
    const result = cn("flex", "items-center", "gap-2");
    expect(result).toBe("flex items-center gap-2");
  });

  it("should return the single class name if only one is provided (happy path)", () => {
    // Test: Returns the single string as is
    const result = cn("single-class");
    expect(result).toBe("single-class");
  });

  it("should concatenate class names with extra whitespace trimmed (happy path)", () => {
    // Test: Trims extra whitespace from each class name
    const result = cn("  foo  ", "  bar  ");
    expect(result).toBe("foo bar");
  });

  it("should handle class names with falsy values (happy path)", () => {
    // Test: Skips falsy values like empty string, false, 0
    const result = cn("foo", "", false, 0, "bar");
    expect(result).toBe("foo bar");
  });

  it("should handle class names with arrays (happy path)", () => {
    // Test: Flattens arrays and concatenates their string elements
    const result = cn(["foo", "bar"], "baz");
    expect(result).toBe("foo bar baz");
  });

  it("should handle class names with nested arrays (happy path)", () => {
    // Test: Flattens nested arrays and concatenates their string elements
    const result = cn(["foo", ["bar", ["baz"]]], "qux");
    expect(result).toBe("foo bar baz qux");
  });

  it("should handle class names with objects (happy path)", () => {
    // Test: Includes keys with truthy values, skips falsy
    const result = cn({ foo: true, bar: false, baz: 1 }, "qux");
    expect(result).toBe("foo baz qux");
  });

  it("should handle class names with a mix of strings, arrays, and objects (happy path)", () => {
    // Test: Handles a complex mix of types
    const result = cn(
      "foo",
      ["bar", { baz: true, qux: false }],
      { quux: 1, corge: 0 }
    );
    expect(result).toBe("foo bar baz quux");
  });

  // Edge Case Tests

  it("should return an empty string if no arguments are provided (edge case)", () => {
    // Test: Returns empty string when called with no arguments
    const result = cn();
    expect(result).toBe("");
  });

  it("should return an empty string if all arguments are falsy (edge case)", () => {
    // Test: Returns empty string when all arguments are falsy
    const result = cn("", false, 0, [], {});
    expect(result).toBe("");
  });

  it("should skip object keys with falsy values (edge case)", () => {
    // Test: Only includes object keys with truthy values
    const result = cn({ foo: false, bar: 0, baz: "" });
    expect(result).toBe("");
  });

  it("should handle deeply nested arrays and objects (edge case)", () => {
    // Test: Flattens and includes only truthy string keys
    const result = cn([
      "foo",
      [
        { bar: true, baz: false },
        ["qux", [{ quux: true, corge: false }]],
      ],
    ]);
    expect(result).toBe("foo bar qux quux");
  });

  it("should ignore non-string, non-object, non-array, non-boolean, non-number values (edge case)", () => {
    // Test: Ignores symbols and functions
    const symbol = Symbol("sym");
    const func = () => "should be ignored";
    const result = cn("foo", symbol, func, "bar");
    expect(result).toBe("foo bar");
  });

  it("should handle numeric class names (edge case)", () => {
    // Test: Includes numbers as class names if they are not 0
    const result = cn("foo", 123, "bar");
    expect(result).toBe("foo 123 bar");
  });

  it("should handle boolean true as a class name (edge case)", () => {
    // Test: Skips boolean true as a class name (should not include 'true')
    const result = cn("foo", true, "bar");
    expect(result).toBe("foo bar");
  });

  it("should handle boolean false as a class name (edge case)", () => {
    // Test: Skips boolean false as a class name (should not include 'false')
    const result = cn("foo", false, "bar");
    expect(result).toBe("foo bar");
  });

  it("should handle empty arrays and objects (edge case)", () => {
    // Test: Skips empty arrays and objects
    const result = cn("foo", [], {}, "bar");
    expect(result).toBe("foo bar");
  });

  it("should handle class names with special characters (edge case)", () => {
    // Test: Includes class names with dashes, underscores, etc.
    const result = cn("foo-bar", "baz_qux", "quux.corge");
    expect(result).toBe("foo-bar baz_qux quux.corge");
  });
});