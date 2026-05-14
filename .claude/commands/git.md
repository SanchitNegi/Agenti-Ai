# /git command

Perform common git operations cleanly and consistently.

## Usage
```
/git <operation> [arguments]
```

## Available operations
```
/git status                        ← show working tree status
/git commit <message>              ← stage all and commit
/git push                          ← push current branch to origin
/git pull                          ← pull latest from origin
/git branch <name>                 ← create and switch to new branch
/git checkout <branch>             ← switch to existing branch
/git merge <branch>                ← merge branch into current
/git log                           ← show recent commit history
/git undo                          ← undo last commit (keep changes)
/git reset                         ← discard all uncommitted changes
/git stash                         ← stash current changes
/git stash pop                     ← restore stashed changes
/git tag <version>                 ← create a version tag
/git sync                          ← pull then push current branch
/git feature <name>                ← create feature branch from main
/git release <version>             ← create release branch + tag
```

---

## Instructions

When this command is run, read `$ARGUMENTS` to determine which operation to perform.
Always confirm what was done after each operation.
Never run destructive operations without stating clearly what will be lost.

---

## Operation definitions

### `/git status`
Run:
```bash
git status
git log --oneline -5
```
Show the current branch, changed files, and last 5 commits.

---

### `/git commit <message>`
Run in order:
```bash
git add .
git status
git commit -m "<message>"
```
Rules:
- Commit message must follow conventional commits format:
  - `feat: add invoice route`
  - `fix: handle null customer id`
  - `chore: update dependencies`
  - `refactor: extract service layer`
  - `docs: update README`
  - `test: add invoice service tests`
- If no message provided — ask the user for one before committing
- Always run `git status` after `git add .` so user can see what is being committed
- Never commit if there is nothing staged

---

### `/git push`
Run:
```bash
git push origin <current-branch>
```
- Detect current branch first with `git branch --show-current`
- If branch has no upstream — run `git push --set-upstream origin <branch>`
- Print the remote URL after pushing

---

### `/git pull`
Run:
```bash
git pull origin <current-branch> --rebase
```
- Always use `--rebase` to keep history clean
- If there are uncommitted changes — stash first, pull, then pop stash

---

### `/git branch <name>`
Run:
```bash
git checkout -b <name>
git push --set-upstream origin <name>
```
Branch naming rules — always enforce these:
- Feature branches: `feat/<name>` e.g. `feat/invoice-api`
- Bug fix branches: `fix/<name>` e.g. `fix/null-customer`
- Chore branches: `chore/<name>` e.g. `chore/update-deps`
- Release branches: `release/<version>` e.g. `release/1.2.0`
- If user gives a name without prefix — ask which type before creating

---

### `/git checkout <branch>`
Run:
```bash
git checkout <branch>
git pull origin <branch> --rebase
```
- Always pull latest after switching branch

---

### `/git merge <branch>`
Run:
```bash
git checkout <current-branch>
git merge <branch> --no-ff -m "merge: <branch> into <current-branch>"
```
- Always use `--no-ff` to preserve branch history
- Always use conventional commit message for merge commit
- Warn user if there are conflicts and show how to resolve

---

### `/git log`
Run:
```bash
git log --oneline --graph --decorate -20
```
Show last 20 commits with branch graph.

---

### `/git undo`
Run:
```bash
git reset --soft HEAD~1
```
- Print clearly: "Last commit undone — your changes are still staged"
- Show what the undone commit was before running

---

### `/git reset`
Run:
```bash
git checkout .
git clean -fd
```
⚠️ ALWAYS warn user first:
```
WARNING: This will permanently discard ALL uncommitted changes.
Files changed: [list them]
Are you sure? (yes/no)
```
Only proceed if user confirms.

---

### `/git stash`
Run:
```bash
git stash push -m "stash: <current-branch> $(date +%Y-%m-%d)"
git stash list
```
- Always add a descriptive stash message with branch and date
- Show stash list after stashing

---

### `/git stash pop`
Run:
```bash
git stash list
git stash pop
```
- Show stash list first so user knows what is being restored
- Warn if there are conflicts after pop

---

### `/git tag <version>`
Run:
```bash
git tag -a v<version> -m "release: v<version>"
git push origin v<version>
```
- Always use annotated tags (`-a`)
- Always prefix with `v` e.g. `v1.2.0`
- Push tag to origin immediately

---

### `/git sync`
Run in order:
```bash
git pull origin <current-branch> --rebase
git push origin <current-branch>
```
- Pull first, then push
- If pull fails — stop and show error, do NOT push

---

### `/git feature <name>`
Run in order:
```bash
git checkout main
git pull origin main --rebase
git checkout -b feat/<name>
git push --set-upstream origin feat/<name>
```
- Always branch off latest `main`
- Always prefix with `feat/`
- Print the new branch name clearly after creation

---

### `/git release <version>`
Run in order:
```bash
git checkout main
git pull origin main --rebase
git checkout -b release/<version>
git tag -a v<version> -m "release: v<version>"
git push --set-upstream origin release/<version>
git push origin v<version>
```
- Always branch off latest `main`
- Always create an annotated tag
- Print summary of branch and tag created

---

## Conventional commit prefixes — always enforce

| Prefix | When to use |
|---|---|
| `feat:` | New feature added |
| `fix:` | Bug fix |
| `chore:` | Maintenance, deps, config |
| `refactor:` | Code restructure, no feature change |
| `docs:` | Documentation only |
| `test:` | Tests added or updated |
| `style:` | Formatting, no logic change |
| `perf:` | Performance improvement |
| `ci:` | CI/CD pipeline changes |
| `merge:` | Merge commits |
| `release:` | Release commits and tags |

---

## Rules Claude must always follow

- Never run `git push --force` — always use `--force-with-lease` if needed and warn user
- Never commit directly to `main` or `master` — always use a branch
- Always show `git status` before committing so user knows what is staged
- Always use `--rebase` when pulling to keep history clean
- Always use annotated tags (`-a`) — never lightweight tags
- Always use `--no-ff` when merging to preserve branch history
- If an operation could lose data — warn the user first and wait for confirmation
- After every operation — print a clear one-line summary of what was done

---

## Summary format — always print after each operation

```
✅ git <operation> complete

  Branch:   feat/invoice-api
  Remote:   origin
  Action:   <what was done>
```
