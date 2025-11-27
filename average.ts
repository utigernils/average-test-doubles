import { NumberSource } from "./number_source.ts";
import { mean, median, mode } from "./statistics.ts";

export class Average {
  constructor(private fileAccess: NumberSource) {}

  public async computeMeanOfFile(): Promise<number> {
    const numbers: Array<number> = await this.fileAccess.readNumbers();
    return mean(numbers);
  }

  public async computeMedianOfFile(): Promise<number> {
    const numbers: Array<number> = await this.fileAccess.readNumbers();
    return median(numbers);
  }

  public async computeModeOfFile(): Promise<Array<number>> {
    const numbers: Array<number> = await this.fileAccess.readNumbers();
    return mode(numbers);
  }
}
