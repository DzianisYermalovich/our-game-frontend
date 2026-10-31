# Our Game

A "Своя игра"-style quiz game: players pick questions from themed boards, answer them, and
accumulate score across rounds. The frontend runs entirely without a backend; games are
configured from a local JSON file and stored in the browser.

## Language

**Game**:
A complete quiz match configuration: its rounds, super round, players, author, and settings.
_Avoid_: match, quiz

**Round**:
A division of a Game containing a set of Topics.

**Topic**:
A themed group of Questions within a Round.

**Question**:
A single answerable board cell with a price, text, answer, and optional media; has a type
(regular, auction, cat, super).
_Avoid_: cell, card

**SuperRound**:
The special final stage of a Game holding its own Question set.

**GameSettings**:
The rules of a Game: number of rounds, topics per round, questions per topic, super-round
questions, and the minimum price.

**Player**:
A person taking part in a Game who answers Questions and accumulates score (as opposed to the
Admin role, who runs it).
_Avoid_: user (User is the shared account type with a role)

**ScoreUpdate**:
The notification that a Player's score changed, which the score column listens for.

**BalloonError**:
A transient on-screen error bubble that reports a problem to the user and auto-hides after a
few seconds.
_Avoid_: toast, snackbar, alert
