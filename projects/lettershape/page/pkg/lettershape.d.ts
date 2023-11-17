/* tslint:disable */
/* eslint-disable */
/**
*/
export class LetterShape {
  free(): void;
/**
* Creates a new `LetterShape` with the given letters.
*
* # Arguments
*
* * `letters` - A string of letters, delimited by a semicolon, representing the letters to permute.
*
* # Returns
*
* A new `LetterShape` instance.
* @param {string} letters
* @returns {LetterShape}
*/
  static new(letters: string): LetterShape;
/**
* Solves the problem.
*
* This method attempts to solve the problem and returns a `Result` indicating success or failure.
* If the problem is solved successfully, it returns `Ok(())`. Otherwise, it returns an `Err` containing
* a boxed `dyn Error` trait object that describes the error encountered during solving.
* @returns {Promise<any>}
*/
  solve(): Promise<any>;
/**
*/
  num_inputs_per_side: number;
/**
*/
  num_sides: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_lettershape_free: (a: number) => void;
  readonly __wbg_get_lettershape_num_sides: (a: number) => number;
  readonly __wbg_set_lettershape_num_sides: (a: number, b: number) => void;
  readonly __wbg_get_lettershape_num_inputs_per_side: (a: number) => number;
  readonly __wbg_set_lettershape_num_inputs_per_side: (a: number, b: number) => void;
  readonly lettershape_new: (a: number, b: number, c: number) => void;
  readonly lettershape_solve: (a: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly wasm_bindgen__convert__closures__invoke1_mut__hdfea067cc7392d72: (a: number, b: number, c: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly wasm_bindgen__convert__closures__invoke2_mut__h32a4e8d6553964ff: (a: number, b: number, c: number, d: number) => void;
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
