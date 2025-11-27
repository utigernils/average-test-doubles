export interface NumberSource {
  readNumbers(): Promise<number[]>;
}
