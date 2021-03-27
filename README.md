## Nard game

This is a simple web-version of [nard game](https://en.wikipedia.org/wiki/Nard_(game)) in development.

# TODO:
- [x] ! Fix error: row above hovers under the board brim in narrow screens
    - [x] Make checkers' size dependable from the board size (/15)
- [x] ! Fix error: cannot select upper checker at the beggining of the game
- [ ] ! Fix error: a ghost checker hovers sometimes. Get rid of any ghost checkers after a step is done.
    - [ ] Noticed when dragging while opponent's turn
- [ ] ! Fix error: restrict unfull move when full move is possible
- [ ] Rules: allows steps when only full move is possible
- [x] Deploy on https://onlinenard.com domain (AWS)
- [ ] Open modal after board (if needed)
- [ ] Steps cancellation
- [ ] Show rival's steps in real time
- [ ] The whole move cancellation (with timout?)
- [ ] Remake design
    - [ ] Mark a selected checker
    - [ ] Add animation for dice tossing
    - [ ] Add animation for checkers placing
    - [ ] Add sounds for dice tossing
    - [ ] Add sounds for checkers placing
- [ ] Show online/offline status of the players
    - [ ] Offer a new game if the rival is offline more than some timeout
- [ ] Link friends with link, not with tabId (open this game via a new tab/window by the link only)
- [ ] Add main menu while playing the game
    - [ ] Add functional like start a new game, mute, etc.
- [ ] Add menu after finishing the game
- [ ] Add different languages: russian, armenian, georgian, spanish
