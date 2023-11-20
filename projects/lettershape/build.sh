#!/bin/bash
export OUT_DIR=./pkg
wasm-pack build --dev --target web --out-dir $OUT_DIR
rm -rf $OUT_DIR/.gitignore
unset OUT_DIR