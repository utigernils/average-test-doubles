import { NumberSource } from "./number_source.ts";

export class FileAccess implements NumberSource {
  constructor(private path: string) {}

  public async readNumbers(): Promise<number[]> {
    const numbers: Array<number> = [];
    const content: string = await Deno.readTextFile(this.path);
    const lines: Array<string> = content.split("\n");
    for (const line of lines) {
      const n = Number.parseInt(line);
      if (!Number.isNaN(n)) {
        numbers.push(n);
      }
    }
    return numbers;
  }
}
