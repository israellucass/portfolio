
## 2026-07-19 [gmzcode, opencode, uninstall]
`gmzcode --uninstall` não existe — o gmzcode é um shell script wrapper (`~/.local/bin/gmzcode`). Remova manualmente: `rm ~/.local/bin/gmzcode ~/.local/bin/opencode ~/.opencode ~/.config/opencode /usr/local/bin/opencode`. O Homebrew também instala `opencode` separadamente em `/opt/homebrew/bin/opencode`.
