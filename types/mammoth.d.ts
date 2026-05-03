declare module "mammoth" {
  interface ExtractRawTextResult {
    value: string;
    messages: unknown[];
  }

  const mammoth: {
    extractRawText(input: { buffer: Buffer }): Promise<ExtractRawTextResult>;
  };

  export default mammoth;
}
