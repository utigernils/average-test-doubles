import { expect } from "@std/expect";
import { Average } from "./average.ts";
import { FileAccess } from "./file_access.ts";
import { NumberSource } from "./number_source.ts";

// Fake: simulates a file system using an in-memory map
class FakeFileAccess implements NumberSource {
  constructor(private path: string, private files: Map<string, number[]> = new Map()) {}
  addFile(path: string, numbers: number[]) {
    this.files.set(path, numbers);
  }
  async readNumbers(): Promise<number[]> {
    return this.files.get(this.path) ?? [];
  }
}

// Fixed stub: always returns the same hard-coded numbers
class FixedStubNumberSource implements NumberSource {
  async readNumbers(): Promise<number[]> {
    return [1, 2, 3, 4, 5];
  }
}

// Configurable stub: returns numbers provided via constructor
class ConfigurableStubNumberSource implements NumberSource {
  constructor(private numbers: number[]) {}
  async readNumbers(): Promise<number[]> {
    return this.numbers;
  }
}

// Mock: like stub but tracks how many times it was called
class MockNumberSource implements NumberSource {
  private callCount = 0;
  getCallCount() {
    return this.callCount;
  }
  async readNumbers(): Promise<number[]> {
    this.callCount++;
    return [5, 5, 5];
  }
}

// Spy: wraps real FileAccess and records calls and returned values
class FileAccessSpy implements NumberSource {
  private callCount = 0;
  private returns: number[][] = [];
  constructor(private wrapped: FileAccess) {}
  async readNumbers(): Promise<number[]> {
    this.callCount++;
    const nums = await this.wrapped.readNumbers();
    this.returns.push(nums);
    return nums;
  }
  getCallCount() {
    return this.callCount;
  }
  getReturns() {
    return this.returns;
  }
}

// Fake test
Deno.test("Average mean with FakeFileAccess", async () => {
  const fake = new FakeFileAccess("/path/to/some/other/file");
  fake.addFile("/path/to/some/other/file", [1, 2, 3, 4, 5]);
  const average = new Average(fake);
  expect(await average.computeMeanOfFile()).toBe(3);
});

// Stub tests (same data, two stub variants)
Deno.test("Average median with FixedStubNumberSource", async () => {
  const stub = new FixedStubNumberSource();
  const average = new Average(stub);
  expect(await average.computeMedianOfFile()).toBe(3);
});

Deno.test("Average median with ConfigurableStubNumberSource", async () => {
  const stub = new ConfigurableStubNumberSource([1, 2, 3, 4, 5]);
  const average = new Average(stub);
  expect(await average.computeMedianOfFile()).toBe(3);
});

// Mock test
Deno.test("Average mode with MockNumberSource increments call counter", async () => {
  const mock = new MockNumberSource();
  const average = new Average(mock);
  const m = await average.computeModeOfFile();
  expect(m).toEqual([5]);
  expect(mock.getCallCount()).toBe(1);
});

// Spy test (uses real file system, requires read/write permissions)
Deno.test({
  name: "FileAccessSpy records single call and returned values",
  permissions: { read: true, write: true },
}, async () => {
  const tmpFile = await Deno.makeTempFile();
  const content = "7\n34\n2\n";
  await Deno.writeTextFile(tmpFile, content);
  const real = new FileAccess(tmpFile);
  const spy = new FileAccessSpy(real);
  const average = new Average(spy);
  const mean = await average.computeMeanOfFile();
  expect(mean).toBe((7 + 34 + 2) / 3);
  expect(spy.getCallCount()).toBe(1);
  expect(spy.getReturns().length).toBe(1);
  expect(spy.getReturns()[0]).toEqual([7, 34, 2]);
});
