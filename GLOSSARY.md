# Our Game

A "Своя игра"-style quiz game: players pick questions from themed boards, answer them, and
accumulate score across rounds. The frontend runs entirely without a backend; games are
configured from a local JSON file and stored in the browser.

## Language

**Game**:
A playthrough created from a GameTemplate: its own Player roster and persistent state
(scores, answered Questions). Many Games can exist per GameTemplate; deleting the
GameTemplate deletes all of them.
_Avoid_: match, quiz; template (that is the GameTemplate)

**Game import**:
Loading a GameTemplate into the app from a user-provided zip (template JSON + media):
parse, validate, store, view. The only way game content arrives; replaced the old
initGame.json fetch.
_Avoid_: upload (nothing is sent to a server), fetch (the removed flow)

**Game media**:
The images and sounds a GameTemplate's Questions reference; imported inside the pack zip
and stored browser-side behind MediaStorage (ADR 0002). Referenced by zip-root-relative
path.
_Avoid_: assets (`assets/` is app-shipped chrome), attachments

**GameTemplate**:
The importable quiz content a Game is created from: name, author, Rounds, SuperRound,
GameSettings, and Game media — viewable but not playable. Edited externally and
re-imported, never in-app.
Russian UI: «Шаблон игры».
_Avoid_: game (that is the playthrough), pack (the zip is the travel format, not the
stored concept)

**Pack**:
The user-provided zip that carries a GameTemplate (template JSON + Game media) for
import — the travel format, not a stored concept.

**Round**:
A division of a GameTemplate containing a set of Topics.

**Topic**:
A themed group of Questions within a Round of a GameTemplate.

**Question**:
A single answerable board cell with a price, text, answer, and optional media; has a type
(regular, auction, cat, super).
_Avoid_: cell, card

**SuperRound**:
The special final stage of a GameTemplate holding its own Question set.

**GameSettings**:
The rules configured on a GameTemplate, applied in every Game created from it: number of
rounds, topics per round, questions per topic, super-round questions, and the minimum
price.

**Player**:
A person taking part in one Game who answers Questions and accumulates score (as opposed to the
Admin role, who runs it); chosen on the per-game roster screen when the Game is created from its
GameTemplate — name plus starting-zero score, never imported.
_Avoid_: user (User is the shared account type with a role)

**ScoreUpdate**:
The notification that a Player's score changed within one Game, which the score column listens
for (a signal bump in ScoreUpdateService).

**BalloonError**:
A transient on-screen error bubble that reports a problem to the user and auto-hides after a
few seconds.
_Avoid_: toast, snackbar, alert
