#!/bin/bash
wasm-pack build --release --target web --no-typescript --out-dir page/pkg
rm -rf page/pkg/.gitignore