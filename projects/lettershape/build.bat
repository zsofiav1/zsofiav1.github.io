#!/bin/bash
wasm-pack build --dev --target web --out-dir pkg
rm -rf page/pkg/.gitignore