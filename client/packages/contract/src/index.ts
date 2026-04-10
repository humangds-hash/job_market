import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CCUFF7AOIPKQZNVH43ZZTZGWNGG2H5HDQVVIYWDSTSTGNGP43WVAR3HP",
  }
} as const


export interface Job {
  description: string;
  employer: string;
  id: u64;
  is_open: boolean;
  title: string;
}

export type DataKey = {tag: "Job", values: readonly [u64]} | {tag: "JobList", values: void};

export interface Client {
  /**
   * Construct and simulate a get_job transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_job: ({id}: {id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Job>>

  /**
   * Construct and simulate a post_job transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  post_job: ({employer, id, title, description}: {employer: string, id: u64, title: string, description: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a close_job transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  close_job: ({employer, id}: {employer: string, id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a list_jobs transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  list_jobs: (options?: MethodOptions) => Promise<AssembledTransaction<Array<u64>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAAA0pvYgAAAAAFAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAAQAAAAAAAAAAhlbXBsb3llcgAAABMAAAAAAAAAAmlkAAAAAAAGAAAAAAAAAAdpc19vcGVuAAAAAAEAAAAAAAAABXRpdGxlAAAAAAAAEA==",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAgAAAAEAAAAAAAAAA0pvYgAAAAABAAAABgAAAAAAAAAAAAAAB0pvYkxpc3QA",
        "AAAAAAAAAAAAAAAHZ2V0X2pvYgAAAAABAAAAAAAAAAJpZAAAAAAABgAAAAEAAAfQAAAAA0pvYgA=",
        "AAAAAAAAAAAAAAAIcG9zdF9qb2IAAAAEAAAAAAAAAAhlbXBsb3llcgAAABMAAAAAAAAAAmlkAAAAAAAGAAAAAAAAAAV0aXRsZQAAAAAAABAAAAAAAAAAC2Rlc2NyaXB0aW9uAAAAABAAAAAA",
        "AAAAAAAAAAAAAAAJY2xvc2Vfam9iAAAAAAAAAgAAAAAAAAAIZW1wbG95ZXIAAAATAAAAAAAAAAJpZAAAAAAABgAAAAA=",
        "AAAAAAAAAAAAAAAJbGlzdF9qb2JzAAAAAAAAAAAAAAEAAAPqAAAABg==" ]),
      options
    )
  }
  public readonly fromJSON = {
    get_job: this.txFromJSON<Job>,
        post_job: this.txFromJSON<null>,
        close_job: this.txFromJSON<null>,
        list_jobs: this.txFromJSON<Array<u64>>
  }
}