# [zsofiav1.github.io](https://zsofiav1.github.io/)

## WASM instructions (for future reference)

1. `cargo new <NAME> --lib`
2. add the following to `Cargo.toml` (or respective versions of the libs):
```
    [lib]
    crate-type = ["cdylib"]

    [dependencies]
    js-sys = "0.3.65"
    wasm-bindgen = "0.2"
```
3. `cargo build`
4. `wasm-pack build --release --target web --no-typescript --out-dir <OUT_DIR>`
5. In your `.js` file, this is how to initialize and use:
```
import init, { <RUST_WASM_FUNCTIONS_AND_STRUCTS> }  from './pkg/<PROJECT>.js';

async function init() {
    await init('./pkg/<PROJECT>_bg.wasm');
}

function example() {
    // if <RUST_WASM_FUNCTIONS_AND_STRUCTS> contains a normal element
    // let's say, a function called `rust_print` and it expects a &str
    rust_print("Hello!");
}

async function async_example() {
    // if <RUST_WASM_FUNCTIONS_AND_STRUCTS> contains an async element (with futures)
    // let's say, a function called `rust_request`
    await rust_request();
}

init();
example();
await async_example();
```
