import _sodium from "libsodium-wrappers"
import CryptoJS from "crypto-js"
import { Buffer } from "buffer"
import { binary_to_base58, base58_to_binary } from "base58-js"
import { words } from "./words"
import type { DigiBackend } from "./common/types"

const PBKDF2_ROUNDS = 2048


class SodiumBackend implements DigiBackend {

  normalize(s: string): string {
    return s.trim().replace(/\s+/g, " ")
  }

  stripSpaces(s: string): string {
    return s.replace(/\s/g, "")
  }

  async mnemonicToKeypair(mnemo: string): Promise<_sodium.KeyPair> {
    let seed = CryptoJS.PBKDF2(mnemo, "digidi", {
      keySize: 64,
      hasher: CryptoJS.algo.SHA512,
      iterations: PBKDF2_ROUNDS,
    }).toString()

    return _sodium.crypto_sign_seed_keypair(
      Uint8Array.from(Buffer.from(seed, "hex").subarray(0, 32)))
  }

  /* impl */

  randomToMnemonic(rnd: string): Promise<string> {
    let dig = CryptoJS.SHA256(rnd).toString()
    let bi = BigInt("0x" + dig)
    let mnemonic = []
    for (let i = 0; i < 10; i++) {
      mnemonic.push(words[Number(bi % BigInt(words.length))])
      bi = bi / BigInt(words.length)
    }
    return Promise.resolve(mnemonic.join(" "))
  }


  async mnemonicToPubkey(mnemo: string): Promise<string> {
    mnemo = this.normalize(mnemo)

    let kp = await this.mnemonicToKeypair(mnemo)
    return binary_to_base58(kp.publicKey)
  }

  async signMessage(mnemo: string, msg: string): Promise<string> {
    mnemo = this.normalize(mnemo)

    let kp = await this.mnemonicToKeypair(mnemo)
    let sig = _sodium.crypto_sign(new TextEncoder().encode(msg),
      kp.privateKey)
    return btoa(String.fromCharCode(...sig))
  }

  async verifyMessage(pubkey: string, signed: string): Promise<string> {
    pubkey = this.stripSpaces(pubkey)
    signed = this.stripSpaces(signed)

    let pk = base58_to_binary(pubkey)
    let sig = Uint8Array.from([...atob(signed)].map(s => s.charCodeAt(0)))

    let opened = _sodium.crypto_sign_open(sig, pk)
    return new TextDecoder().decode(opened)
  }

  async generateRandom(bytesCount: number): Promise<string> {
    return CryptoJS.lib.WordArray.random(bytesCount).toString(CryptoJS.enc.Base64)
  }
}
export async function newSodiumBackend(): Promise<SodiumBackend> {
  await _sodium.ready
  return new SodiumBackend()
}
