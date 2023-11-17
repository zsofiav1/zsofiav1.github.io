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
4. `wasm-pack build --release --target web --out-dir <OUT_DIR>`