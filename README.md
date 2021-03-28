## Nard game

This is a simple web-version of [nard game](https://en.wikipedia.org/wiki/Nard_(game)) in development.

# TODO:
- [x] ! Fix error: row above hovers under the board brim in narrow screens
    - [x] Make checkers' size dependable from the board size (/15)
- [x] ! Fix error: cannot select upper checker at the beggining of the game
- [x] ! Fix error: a ghost checker hovers sometimes. Get rid of any ghost checkers after a step is done.
    - [x] Noticed when dragging while opponent's turn
- [x] ! Fix error: Rules: restrict unfull move when full move is possible
    - [ ] Check if it works or not
- [ ] Fix bug: center ghost checker position when dragging by mouse
- [ ] Rules: 2nd move 3-3: allow all the steps (1st 3 & you have to move another checker. Let user use the same checker again)
- [x] Rules: restrict dice-steps when only full move is possible
- [x] Remove selection for moving (leave it just for checking possible steps). In order to move a checker you need to drag it.
- [x] Deploy on https://onlinenard.com domain (AWS)
- [ ] Open modal after board (if needed)
- [ ] Make steps cancellation
    - [ ] Cancel each step but the last one
    - [ ] The whole move cancellation (with timout?)
- [ ] Show rival's steps in real time
- [ ] Remake design
    - [ ] Mark a selected checker
    - [ ] Add animation for dice tossing
    - [ ] Add animation for checkers placing
    - [ ] Add sounds for dice tossing
    - [ ] Add sounds for checkers placing
    - [ ] Fade out dice that are unactive (or rival's dice)
- [ ] Show online/offline status of the players
    - [ ] Offer a new game if the rival is offline more than some timeout
- [ ] Link friends with link, not with tabId (open this game via a new tab/window by the link only)
- [ ] Add main menu while playing the game
    - [ ] Add functional like start a new game, mute, etc.
- [ ] Add menu after finishing the game
- [ ] Add different languages: russian, armenian, georgian, spanish
- [ ] Make the board size ajastable (like in lichess.com)
