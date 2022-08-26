export interface DigiBackend {
  randomToMnemonic(rnd: string): Promise<string>;
  mnemonicToPubkey(mnemo: string): Promise<string>;
  signMessage(mnemo: string, msg: string): Promise<string>;
  verifyMessage(pubkey: string, signed: string): Promise<string>;
  generateRandom(bytesCount: number): Promise<string>;
}

