#!/usr/bin/env bash
# Git-flow guardrails — PreToolUse hook (wired in .claude/settings.json).
#
# Enforces GitHub flow for this repo: the agent works on feature branches and
# delivers PRs; the user reviews and merges. Blocks:
#   - commits/merges/resets/rebases/cherry-picks on protected branches
#   - pushing protected branches (or --all/--mirror)
#   - moving/deleting protected branches (git branch -f/-D/-m)
#   - gh pr merge (merging belongs to the user)
# Allows everything else, including pushing feature branches.

# Protected refs: regex matched against the branch name.
PROTECTED_RE='^(develop|master|Release-.*)$'

input=$(cat)
command=$(printf '%s' "$input" | node -e '
let d = "";
process.stdin.on("data", (c) => (d += c));
process.stdin.on("end", () => {
  try { process.stdout.write(JSON.parse(d).tool_input?.command ?? ""); }
  catch { /* malformed input -> allow */ }
});')

[ -z "$command" ] && exit 0

current_branch=$(git branch --show-current 2>/dev/null)
is_protected() { printf '%s' "$1" | grep -qE "$PROTECTED_RE"; }

block() {
  echo "BLOCKED: $1" >&2
  echo "GitHub flow: work on a feature branch off origin/develop, push it, and open a PR with \`gh pr create --base develop\`. The user reviews and merges PRs — never write to develop/master/Release-* directly." >&2
  exit 2
}

handle_push() {
  local refs=() allflag=0 t r dst
  for t in "${args[@]}"; do
    case "$t" in
      --all|--mirror|--branches|--tags) allflag=1 ;;
    esac
  done
  [ "$allflag" = 1 ] && block "git push --all/--mirror can update protected branches."
  for t in "${args[@]}"; do
    case "$t" in
      -*) : ;;                      # flags, including --force on a feature branch (allowed)
      origin|upstream) : ;;         # remote names
      *) refs+=("$t") ;;
    esac
  done
  if [ ${#refs[@]} -eq 0 ]; then
    refs=("$current_branch")        # bare push updates the current branch
  fi
  for r in "${refs[@]}"; do
    r="${r#+}"                      # strip force marker
    dst="${r##*:}"                  # the remote side of the refspec
    [ "$dst" = "HEAD" ] && dst="$current_branch"
    case "$dst" in refs/heads/*) dst="${dst#refs/heads/}" ;; esac
    [ -z "$dst" ] && continue
    is_protected "$dst" && block "git push to protected branch '$dst'."
  done
}

handle_branch() {
  local move=0 t
  for t in "${args[@]}"; do
    case "$t" in -D|-f|--force|-m|-M|--move|--force-move) move=1 ;; esac
  done
  if [ "$move" = 1 ]; then
    for t in "${args[@]}"; do
      case "$t" in -*) : ;; *) is_protected "$t" && block "git branch: cannot move/delete protected branch '$t'." ;; esac
    done
  fi
}

# Split compound commands (a && b; c | d) and check each segment.
segmented=$(printf '%s' "$command" | tr ';|&\n' '\n\n\n\n')
while IFS= read -r seg; do
  mode="none"   # none -> git -> sub | gh
  sub=""
  args=()
  for t in $seg; do
    case "$mode" in
      none) case "$t" in git|git.exe) mode="git" ;; gh) mode="gh" ;; esac ;;
      git)  case "$t" in -*) : ;; *) sub="$t"; mode="sub" ;; esac ;;
      *)    args+=("$t") ;;
    esac
  done

  case "$mode" in
    gh)
      has_pr=0; has_merge=0
      for t in "${args[@]}"; do
        case "$t" in pr) has_pr=1 ;; merge) has_merge=1 ;; esac
      done
      [ "$has_pr" = 1 ] && [ "$has_merge" = 1 ] && block "gh pr merge: merging is the user's job."
      ;;
    sub)
      case "$sub" in
        push)
          handle_push
          ;;
        commit|merge|rebase|cherry-pick|reset)
          is_protected "$current_branch" && block "git $sub on protected branch '$current_branch'."
          ;;
        branch)
          handle_branch
          ;;
      esac
      ;;
  esac
done <<< "$segmented"

exit 0
