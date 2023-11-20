@REM turning echo off
@echo off

@REM Converting the following to a batch file:
@REM ```bash
@REM #!/bin/bash
@REM export OUT_DIR=./pkg
@REM wasm-pack build --dev --target web --out-dir $OUT_DIR
@REM rm -rf $OUT_DIR/.gitignore
@REM unset OUT_DIR
@REM ```

@REM Set the output directory
set OUT_DIR=./pkg

@REM Build the project
wasm-pack build --dev --target web --out-dir %OUT_DIR%

@REM Remove the .gitignore file
del %OUT_DIR:~2%\.gitignore

@REM Unset the output directory
set OUT_DIR=