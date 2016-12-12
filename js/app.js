 console.log('loaded');

// /*
// TO DO
// - card faces
// - overlap cards and then reduce width when splitting
// */
//
// var rank = ['A',2,3,4,5,6,7,8,9,10,'J','Q','K'];
// var suit = ['s','h','c','d'];
// var deck = [];
// var numberOfDecks = 4;
// var playerCards = [], dealerCards = [], playerCardsSplit = [];
// var tens = ['J','Q','K'];
// var highCards = ['J','Q','K','A'];
// var stand = true;
// var cardCount = 0;
// var sum, newCard, cardsInShoe, decksLeft, shuffledDeck, aceCounter, balance, betSize, bust, blackjack, double, split;
//
// function makeDeck() {
//   $(rank).each(function(indexR, valueR) {
//     $(suit).each(function(indexS, valueS) {
//       for (var i = 0; i < numberOfDecks; i++) {
//         deck.push(valueR + suit[indexS]);
//       }
//     });
//   });
//   cardsInShoe = numberOfDecks * 52;
//   cardCount = 0;
//   updateCounter();
// }
//
// $('#newGame').click(newGame);
//
// function newGame() {
//   stand = true;
//   resetCards();
//   balance = 1000;
//   makeDeck();
//   shuffledDeck = shuffle(deck);
//   addButtonsAndListeners();
// }
//
// function addButtonsAndListeners() {
//   if ($('.choice').is(':empty')){
//     $('.choice').append('<li class="selection" id="playNextHand">Deal</li>');
//     $('.choice').append('<li class="selection">Hit</li><li class="selection">Stand</li><li class="selection">Double</li><li class="selection">Split</li>');
//     $('.betting').append('<li id="betLi">Bet: <input id="bet" type="number" value="10"></li>');
//     updateBalance(0);
//     $('#playNextHand').click(playRound);
//     $('.selection').click(gamePlay);
//   }
// }
//
// function playRound() {
//   if (stand || bust || blackjack) {
//     $('.playerCardsSplit').remove();
//     bet();
//     resetCards();
//     dealInitialCards();
//     stand = bust = blackjack = double = split = false;
//     checkForBlackjack();
//     choice(playerCards);
//   } else alert('You must finish the current hand first.');
// }
//
// function gamePlay() {
//   if (!stand && !bust && !blackjack) {
//     choice(playerCards);
//     if ($(this).text() === 'Hit') {
//       hitLogic(playerCards);
//     } else if ($(this).text() === 'Stand') {
//       standLogic(playerCards);
//     } else if ($(this).text() === 'Double') {
//       doubleLogic(playerCards);
//     } else if ($(this).text() === 'Split') {
//       splitLogic();
//     }
//   } else if (split && stand) {
//     if ($(this).text() === 'Hit') {
//       hitLogic(playerCardsSplit);
//     } else if ($(this).text() === 'Stand') {
//       standLogic(playerCardsSplit);
//     } else if ($(this).text() === 'Double') {
//       doubleLogic(playerCardsSplit);
//     }
//   }
// }
//
// function shuffle(array) {
//   var m = array.length, t, i;
//   while (m) {
//     i = Math.floor(Math.random() * m--);
//     t = array[m];
//     array[m] = array[i];
//     array[i] = t;
//   }
//   return array;
// }
//
// function resetCards() {
//   playerCards = [];
//   dealerCards = [];
//   playerCardsSplit =[];
//   $('.card').remove();
//   $('.status').text('');
// }
//
// function dealInitialCards() {
//   dealCard(playerCards);
//   dealCard(dealerCards);
//   dealCard(playerCards);
//   dealCard(dealerCards);
// }
//
// function dealCard(array) {
//   if (cardsInShoe === 0) {
//     makeDeck();
//     shuffledDeck = shuffle(deck);
//   }
//   newCard = shuffledDeck.shift();
//   array.push(newCard);
//   if (parseInt(newCard) >= 2 && parseInt(newCard) < 7) cardCount++;
//   if (parseInt(newCard) === 10 || highCards.indexOf(newCard.charAt(0)) !== -1) cardCount--;
//   cardsInShoe--;
//   updateCounter();
//   if (array === playerCards) {
//     $('.playerCards').append('<li class="card" id=' + newCard + '>' + newCard + '</li>');
//   } else if (array === dealerCards) {
//     $('.dealerCards').append('<li class="card">' + newCard + '</li>');
//   } else if (array === playerCardsSplit) {
//     $('.playerCardsSplit').append('<li class="card">' + newCard + '</li>');
//   }
// }
//
// function sumArray(array) {
//   sum = 0;
//   aceCounter = 0;
//   $(array).each(function(index, value) {
//     if (tens.indexOf(value.charAt(0)) !== -1) value = 10;
//     if (value.toString().includes('A')) {
//       aceCounter++;
//       value = 11;
//     }
//     sum += parseInt(value);
//   });
//   for (var i=1  ; i <= aceCounter; i++) {
//     if (sum > 21 && aceCounter >=i) sum -= 10;
//   }
//   return sum;
// }
//
// function checkForBlackjack() {
//   if (sumArray(dealerCards) === 21 && sumArray(playerCards) !== 21) {
//     blackjack = true;
//     $('.status').text('Unlucky! Dealer has blackjack - you lose this hand.');
//   } else if (sumArray(dealerCards) === 21 && sumArray(playerCards) === 21) {
//     blackjack = true;
//     $('.status').text('Both you and the dealer have blackjack! It\'s a draw!');
//     updateBalance(betSize);
//   } else if (sumArray(dealerCards) !== 21 && sumArray(playerCards) === 21) {
//     blackjack = true;
//     $('.status').text('Blackjack! You win this hand.');
//     updateBalance(2.5 * betSize);
//   }
// }
//
// function choice(array, round = 'first') {
//   if (split) {
//     $('.status').text('Your ' + round + ' cards are ' + array.join() + ' - a total of ' + sumArray(array) + '. What would you like to do?');
//   } else if (!blackjack) {
//     $('.status').text('Your cards are ' + array.join() + ' - a total of ' + sumArray(array) + '. What would you like to do?');
//   }
// }
//
// function hitLogic(array) {
//   dealCard(array);
//   if (sumArray(array) > 21) {
//     busted(array);
//   } else {
//     choice(array);
//   }
// }
//
// function busted(array) {
//   $('.status').text('BUST! Your cards are ' + array.join() + ' - a total of ' + sumArray(array) + '.');
//   bust = true;
// }
//
// function standLogic(array) {
//   stand = true;
//   if (!split) {
//     while (sumArray(dealerCards) < 17) {
//       dealCard(dealerCards);
//     }
//     determineWinner(array);
//   }
//   if (split === true && array === playerCards) {
//     choice(playerCardsSplit, 'second');
//   }
//   if (split === true && array === playerCardsSplit) {
//     while (sumArray(dealerCards) < 17) {
//       dealCard(dealerCards);
//     }
//     determineWinner(playerCards, 'First hand: ');
//     determineWinner(playerCardsSplit, '<br />Second hand: ');
//   }
// }
//
// function doubleLogic(array) {
//   updateBalance(-betSize);
//   double = true;
//   dealCard(array);
//   if (sumArray(array) > 21) {
//     busted(array);
//   } else {
//     standLogic(array);
//   }
// }
//
// function splitLogic() {
//   if (playerCards[0].slice(0,-1) === playerCards[1].slice(0,-1)) {
//     split = true;
//     updateBalance(-betSize);
//     $('.playerCards').after('<ul class="playerCardsSplit" id="splitBoard"></ul>');
//     $('.playerCards .card').eq(1).appendTo('#splitBoard');
//     playerCardsSplit.push(playerCards.pop());
//     dealCard(playerCards), dealCard(playerCardsSplit);
//     choice(playerCards, 'first');
//   }
// }
//
// function determineWinner(array, hand = '') {
//   if (array !== playerCardsSplit) $('.status').text('');
//   if (sumArray(array) > sumArray(dealerCards) || sumArray(dealerCards) > 21) {
//     $('.status').append(hand + 'Congratulations! You win this hand - your ' + sumArray(array) + ' beats the dealer\'s ' + sumArray(dealerCards) + '. ');
//     updateBalance(betSize*2);
//   } else if (sumArray(array) === sumArray(dealerCards)) {
//     $('.status').append(hand + 'It\'s a draw! Both you and the dealer have ' + sumArray(array) + '. ');
//     updateBalance(betSize);
//   } else {
//     $('.status').append(hand + 'Unlucky! You lose this hand. The dealer\'s ' + sumArray(dealerCards) + ' beats your ' + sumArray(array) + '. ');
//   }
// }
//
// function updateCounter() {
//   decksLeft = (cardsInShoe/52);
//   $('#cardsInShoe').text('Cards left in shoe: ' + cardsInShoe + ' (' + decksLeft.toFixed(1) + ' decks).');
//   $('#count').text('Card count: ' + cardCount);
//   $('#trueCount').text('True count: ' + (cardCount/decksLeft).toFixed(1));
// }
//
// function updateBalance(x) {
//   if (!double) balance = balance + x;
//   else balance = balance + 2*x;
//   console.log(x);
//   $('.balance').text('Bank balance: ' + balance);
// }
//
// function bet() {
//   betSize = parseInt($('#bet').val());
//   updateBalance(-betSize);
// }
