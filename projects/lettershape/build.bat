#!/bin/bash
wasm-pack build --dev --target web --out-dir page/pkg
rm -rf page/pkg/.gitignore