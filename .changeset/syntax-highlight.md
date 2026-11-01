---
'@dskripchenko/ui': minor
---

`UidCode` highlights through `@dskripchenko/syntax`: some 35 languages and formats instead of 17 (Rust, C/C++, Ruby, Lua, TOML, INI, Dockerfile, Makefile, diff, logs, Markdown, GraphQL, protobuf and more), nested code read properly (a variable inside a string, a script inside HTML, interpolation in template strings). `tokenize` and `isHighlightable` keep their signatures; `UidCodeTokenType` gains the new kinds (`type`, `operator`, `regex`, `meta`, `escape`, `heading`, `emphasis`, `strong`, `link`, `inserted`, `deleted`, `date`, `error`, `warning`, `info`, `debug`), each with a `uid-code__tok--*` class. Some tokens are split differently: a tag's name is `tag` and its brackets `punctuation`; PHP's `<?php`, Python's decorators and HTTP's version are `meta`; an HTML entity is `escape`.
