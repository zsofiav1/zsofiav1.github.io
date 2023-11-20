/* tslint:disable */
/* eslint-disable */
/**
* @returns {string}
*/
export function delim(): string;
/**
*/
export class LetterShape {
  free(): void;
/**
* Creates a new instance of `LetterShape`.
* 
* # Returns
* 
* Returns a `Result` containing the `LetterShape` instance if successful, or a `JsValue` error if an error occurs.
* @returns {Promise<LetterShape>}
*/
  static new(): Promise<LetterShape>;
/**
* Solves the problem.
*
* This method attempts to solve the problem and returns a `Result` indicating success or failure.
* If the problem is solved successfully, it returns `Ok(())`. Otherwise, it returns an `Err` containing
* a boxed `dyn Error` trait object that describes the error encountered during solving.
* @param {string} letters
* @returns {Promise<any>}
*/
  solve(letters: string): Promise<any>;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly delim: () => number;
  readonly __wbg_lettershape_free: (a: number) => void;
  readonly lettershape_new: () => number;
  readonly lettershape_solve: (a: number, b: number, c: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hdf21e38f70f1195b: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly wasm_bindgen__convert__closures__invoke2_mut__h4b7f56631ab542e9: (a: number, b: number, c: number, d: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
