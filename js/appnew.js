/*
TO DO
- HOW DO I DEAL ONE CARD AFTER THE OTHER? (without messing up rest of code)
- overlap cards and then reduce width when splitting
- Add timer to cards being dealt
- Add shuffle animation
- MAYBE add insurance
*/

var Bj = Bj || {};


var ranks = ['A',2,3,4,5,6,7,8,9,10,'J','Q','K'];
var suits = ['s','h','c','d'];
var htmlSuits = ['&spades;','&hearts;','&clubs;','&diams;'];
var deck = [];
var numberOfDecks = 1;
var playerCards = [], dealerCards = [], playerCardsSplit = [];
var stand = true;
var cardCount = 0;
var sum, newCard, cardsInShoe, decksLeft, shuffledDeck, aceCounter, balance, betSize, bust, bustSplit, blackjack, double, split;


function Card(rank, suit, htmlSuit) {
  this.rank = rank;
  this.suit = suit;
  this.score = (!isNaN(rank))? rank : ((rank === 'A')? 1 : 10);
  this.htmlSuit = htmlSuit;
}

function makeDeck() {
  $(ranks).each(function(indexR) {
    $(suits).each(function(indexS) {
      for (var i = 0; i < numberOfDecks; i++) {
        deck.push(new Card(ranks[indexR], suits[indexS], htmlSuits[indexS]));
      }
    });
  });
  cardsInShoe = numberOfDecks * 52;
  cardCount = 0;
  updateCounter();
}

$('#newGame').click(newGame);

function newGame() {
  stand = true;
  resetCards();
  balance = 1000;
  makeDeck();
  shuffledDeck = shuffle(deck);
  addButtonsAndListeners();
}

function addButtonsAndListeners() {
  if ($('.choice').is(':empty')){
    $('.choice').append('<li id="deal">Deal</li>');
    $('.choice').append('<li class="selection">Hit</li><li class="selection">Stand</li><li class="selection">Double</li><li class="selection">Split</li>');
    $('.betting').append('<li id="betLi">Bet: <input id="bet" type="number" value="10"></li>');
    updateBalance(0);
    $('#deal').click(deal);
    $('.selection').click(gamePlay);
  }
}

function deal() {
  if (stand || bust || blackjack) {
    $('.playerCardsSplit').remove();
    bet();
    resetCards();
    $('.status').text('Dealing cards...');
    stand = bust = blackjack = double = split = bustSplit = false;
    dealInitialCards(checkForBlackjack);
  } else alert('You must finish the current hand first.');
}

function gamePlay() {
  if (!stand && !bust && !blackjack) {
    choice(playerCards);
    if ($(this).text() === 'Hit') {
      hitLogic(playerCards);
    } else if ($(this).text() === 'Stand') {
      standLogic(playerCards);
    } else if ($(this).text() === 'Double') {
      doubleLogic(playerCards);
    } else if ($(this).text() === 'Split') {
      splitLogic();
    }
  } else if ((split && stand && !bustSplit) || (split && bust && !bustSplit)) {
    if ($(this).text() === 'Hit') {
      hitLogic(playerCardsSplit);
    } else if ($(this).text() === 'Stand') {
      standLogic(playerCardsSplit);
    } else if ($(this).text() === 'Double') {
      doubleLogic(playerCardsSplit);
    }
  }
}

function shuffle(array) {
  var m = array.length, t, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}

function resetCards() {
  playerCards = [];
  dealerCards = [];
  playerCardsSplit =[];
  $('.card').remove();
  $('.status').text('Welcome to Blackjack');
}

function dealInitialCards(callback) {
  var i = 0;
  var interval = setInterval(dealCards, 1000);
  function dealCards() {
    dealCard(playerCards);
    dealCard(dealerCards);
    i++;
    if (i > 1) {
      clearInterval(interval);
      callback();
    }
  }
}

// function dealInitialCards() {
//   dealCard(playerCards);
//   dealCard(dealerCards);
//   dealCard(playerCards);
//   dealCard(dealerCards);
// }

function dealCard(array) {
  if (cardsInShoe === 0) {
    makeDeck();
    shuffledDeck = shuffle(deck);
  }
  newCard = shuffledDeck.shift();
  array.push(newCard);
  if (newCard.score >= 2 && newCard.score < 7) cardCount++;
  if (newCard.score === 10) cardCount--;
  cardsInShoe--;
  updateCounter();
  if (array === playerCards) {
    $(cardHTML(newCard)).appendTo($('.playerCards')).hide().fadeIn(300);
  } else if (array === dealerCards) {
    if (array.length === 1) {
      $(cardHTML(newCard, 'holeCard')).appendTo($('.dealerCards')).hide().fadeIn(300);
      hideDealerCard();
    } else     $(cardHTML(newCard)).appendTo($('.dealerCards')).hide().fadeIn(300);
  } else if (array === playerCardsSplit) {
    $(cardHTML(newCard)).appendTo($('.playerCardsSplit')).hide().fadeIn(300);
  }
}

function sumArray(array) {
  sum = 0;
  aceCounter = 0;
  $(array).each(function(index, value) {
    if (value.rank === 'A') {
      aceCounter++;
      value.score = 11;
    }
    sum += value.score;
  });
  for (var i=1  ; i <= aceCounter; i++) {
    if (sum > 21 && aceCounter >= i) sum -= 10;
  }
  return sum;
}

function checkForBlackjack() {
  if (sumArray(dealerCards) === 21 && sumArray(playerCards) !== 21) {
    blackjack = true;
    showDealerCard();
    $('.status').text('Unlucky! Dealer has blackjack - you lose this hand.');
  } else if (sumArray(dealerCards) === 21 && sumArray(playerCards) === 21) {
    blackjack = true;
    showDealerCard();
    $('.status').text('Both you and the dealer have blackjack! It\'s a draw!');
    updateBalance(betSize);
  } else if (sumArray(dealerCards) !== 21 && sumArray(playerCards) === 21) {
    blackjack = true;
    showDealerCard();
    $('.status').text('Blackjack! You win this hand.');
    updateBalance(2.5 * betSize);
  }
  choice(playerCards);
}

function choice(array, round = 'first') {
  if (split) {
    $('.status').text('Your ' + round + ' cards are ' + returnCards(array) + ' - a total of ' + sumArray(array) + '. What would you like to do?');
  } else if (!blackjack) {
    $('.status').text('Your cards are ' + returnCards(array) + ' - a total of ' + sumArray(array) + '. What would you like to do?');
  }
}

function hitLogic(array) {
  dealCard(array);
  if (sumArray(array) > 21) {
    busted(array);
  } else {
    choice(array);
  }
}

function busted(array) {
  $('.status').text('BUST! Your cards are ' + returnCards(array) + ' - a total of ' + sumArray(array) + '.');
  if (array === playerCards) {
    bust = true;
  } else bustSplit = true;
  if (!split || (split && bustSplit)) {
    dealerPlays();
    determineWinner(playerCards);
    if (bustSplit) determineWinner(playerCardsSplit);
  } else if (split === true && array === playerCards) {
    choice(playerCardsSplit, 'second');
  }
}

function standLogic(array) {
  stand = true;
  if (!split) {
    dealerPlays();
    determineWinner(array);
  }
  if (split === true && array === playerCards) {
    choice(playerCardsSplit, 'second');
  }
  if (split === true && array === playerCardsSplit) {
    dealerPlays();
    determineWinner(playerCards, 'First hand: ');
    determineWinner(playerCardsSplit, '<br />Second hand: ');
  }
}

function doubleLogic(array) {
  updateBalance(-betSize);
  double = true;
  dealCard(array);
  if (sumArray(array) > 21) {
    busted(array);
  } else {
    standLogic(array);
  }
}

function splitLogic() {
  if ((playerCards[0].score === playerCards[1].score) && playerCards.length === 2) {
    split = true;
    updateBalance(-betSize);
    $('.playerCards').after('<ul class="playerCardsSplit" id="splitBoard"></ul>');
    $('.playerCards .card').eq(1).appendTo('#splitBoard');
    playerCardsSplit.push(playerCards.pop());
    dealCard(playerCards), dealCard(playerCardsSplit);
    choice(playerCards, 'first');
  }
}

function determineWinner(array, hand = '') {
  if (array !== playerCardsSplit) $('.status').text('');
  if (sumArray(array) > 21) {
    $('.status').append(hand + 'Unlucky! You lose this hand. The dealer\'s ' + sumArray(dealerCards) + ' beats your busted ' + sumArray(array) + '. ');
  } else if (sumArray(array) > sumArray(dealerCards) || sumArray(dealerCards) > 21) {
    $('.status').append(hand + 'Congratulations! You win this hand - your ' + sumArray(array) + ' beats the dealer\'s ' + sumArray(dealerCards) + '. ');
    updateBalance(betSize*2);
  } else if (sumArray(array) === sumArray(dealerCards)) {
    $('.status').append(hand + 'It\'s a draw! Both you and the dealer have ' + sumArray(array) + '. ');
    updateBalance(betSize);
  } else {
    $('.status').append(hand + 'Unlucky! You lose this hand. The dealer\'s ' + sumArray(dealerCards) + ' beats your ' + sumArray(array) + '. ');
  }
}

function updateCounter() {
  decksLeft = (cardsInShoe/52);
  $('#cardsInShoe').text('Cards left in shoe: ' + cardsInShoe + ' (' + decksLeft.toFixed(1) + ' decks).');
  $('#count').text('Card count: ' + cardCount);
  $('#trueCount').text('True count: ' + (cardCount/decksLeft).toFixed(1));
}

function updateBalance(x) {
  if (!double) balance = balance + x;
  else balance = balance + 2*x;
  $('.balance').text('Bank balance: ' + balance);
}

function bet() {
  betSize = parseInt($('#bet').val());
  updateBalance(-betSize);
}

function returnCards(array) {
  var newArray = array.map(function(value) {
    return value.rank.toString().concat(value.suit);
  });
  return newArray.join();
}

function cardHTML(x, hiddenClass = '') {
  return $('<li class="card rank' + x.rank + ' ' + x.suit + ' ' + hiddenClass + '">' + newCard.rank + '<br />' + x.htmlSuit + '</li>');
}

function hideDealerCard() {
  $('.holeCard').css('color', 'transparent');
}

function showDealerCard() {
  $('.holeCard').css('color', '');
  $('.holeCard').removeClass('holeCard');
}

function dealerPlays() {
  showDealerCard();
  while (sumArray(dealerCards) < 17) {
    dealCard(dealerCards);
  }
}
