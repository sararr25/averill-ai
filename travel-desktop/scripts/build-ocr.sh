#!/bin/sh
set -eu
cache_dir="$(mktemp -d /private/tmp/averill-swift-cache.XXXXXX)"
trap 'rm -rf "$cache_dir"' EXIT
SWIFT_MODULECACHE_PATH="$cache_dir" CLANG_MODULE_CACHE_PATH="$cache_dir" swiftc scripts/extract-text.swift -o scripts/extract-text-macos-arm64
