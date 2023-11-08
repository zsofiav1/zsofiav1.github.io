/* tslint:disable */
/* eslint-disable */
/**
* @returns {any}
*/
export function get_memory(): any;
/**
*/
export class GameOfLife {
  free(): void;
/**
* @param {number} w
* @param {number} h
* @returns {GameOfLife}
*/
  static new(w: number, h: number): GameOfLife;
/**
* @returns {number}
*/
  size(): number;
/**
* @returns {number}
*/
  render(): number;
/**
*/
  tick(): void;
/**
* @param {number} row
* @param {number} col
*/
  toggle_cell(row: number, col: number): void;
/**
*/
  height: number;
/**
*/
  width: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_gameoflife_free: (a: number) => void;
  readonly __wbg_get_gameoflife_width: (a: number) => number;
  readonly __wbg_set_gameoflife_width: (a: number, b: number) => void;
  readonly __wbg_get_gameoflife_height: (a: number) => number;
  readonly __wbg_set_gameoflife_height: (a: number, b: number) => void;
  readonly gameoflife_new: (a: number, b: number) => number;
  readonly gameoflife_size: (a: number) => number;
  readonly gameoflife_render: (a: number) => number;
  readonly gameoflife_tick: (a: number) => void;
  readonly gameoflife_toggle_cell: (a: number, b: number, c: number) => void;
  readonly get_memory: () => number;
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
