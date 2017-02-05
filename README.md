# Blackjack

picture 1

picture 2

## Overview
Blackjack was created as my first project for a 12-week Web Development Immersive course at General Assembly in London. It was built using basic HTML, CSS and JavaScript/jQuery. 

The game can be played here: [Blackjack](https://js-blackjack.herokuapp.com/).

## Rules
Blackjack, also known as 21, is a casino-based game where the player plays against the dealer. The goal of Blackjack is to beat the dealer's hand without going over 21. A basic summary of the rules can be found here: [Blackjack rules](http://www.hitorstand.net/strategy.php).

## Code overview

#### The deck

- Each deck consists of 52 card objects with rank and suit properties
- The shoe (consisting of 4 decks) is shuffled using the Fisher-Yates Shuffle algorithm
- Cards are dealt visibly using the jQuery *animate* method, with accompanying 'swipe' dealing sound. The dealing is staggered using the *setInterval* method
- The card faces are placed onto the cards using CSS spriting, inspired by [this blog post](https://spin.atomicobject.com/2013/02/22/css-sprite-semantics-scaleability/). Each face image is cut out of one single image

#### Gameplay logic

- The player first decides how much to bet, starting with a balance of 1000
- Upon dealing of the cards, the *checkForBlackjack* function runs. If the player and/or dealer has Blackjack, the hand ends there.
- The player is presented with four options: hit, stand, double, and split. Splitting is only possible when the player has two cards of the same value
- The logic for hitting, doubling and splitting is split into separate functions
- If the player goes bust (i.e. goes over 21), the hand ends there
- If the player stands, the dealer plays according to the normal casino rule: hitting until reaching a score of 17 or above. The dealer's face-down card is also turned over
- Once the dealer stands, the *determineWinner* function displays the winner and adjusts the player's balance as required
- Aces can be worth 1 or 11 - this is dealt with by treating aces as 11, and subtracting 10 per ace as necessary if the player/dealer's score is above 21
- The code also contains card counting logic, based upon the [high-low counting strategy](https://wizardofodds.com/games/blackjack/card-counting/high-low/). However I only got as far showing this count (or hiding, based upon a toggle) on the board

### Styling

- The main focus of the website is an image of a Blackjack table
- The colours of the gameplay buttons were chosen to match the table
- Positions and sizes are fixed (i.e. not responsive). The game can be played to an acceptable standard on a portrait iPad or landscape iPhone

### Challenges/learnings

The main challenge was the large amount of gameplay logic required, and the interdependency of the logic. Getting to a MVP 'Hit-or-Stand' Blackjack was relatively easy. Adding features such as doubling, standing and betting proved much harder - largely due to the effect of adding each feature on the existing code. 

Another challenge was moving from a static game to a more dynamic game involving intervals and callbacks. This gave me a much better understanding of callbacks - why and when they are needed.

### Further work

With more time, I would have introduced a 'trainer' feature to help users become better at Blackjack. This would have used the existing card-counting functionality to help users learn to count cards, as well as optional hints on the optimal move to make in each hand.




