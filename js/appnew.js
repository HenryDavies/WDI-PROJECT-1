// TO DO
// - overlap cards and then reduce width when splitting
// - Add shuffle animation
// - MAYBE add insurance


//  TO DO NEXT - check determineWinner for other functions (hit is done)

var Bj = Bj || {};

$(function() {
  $('#newGame').click(Bj.newGame);
});

Bj.newGame = function() {
  Bj.balance = 1000;
  Bj.roundOver = true;
  Bj.resetCards();
  Bj.makeDeck();
  Bj.shuffleDeck();
  Bj.addButtonsAndListeners();
};

Bj.deal = function() {
  if (Bj.roundOver) {
    Bj.roundOver = Bj.stand = Bj.bust = Bj.blackjack = Bj.double = Bj.split = Bj.bustSplit = false;
    $('.playerCardsSplit').remove();
    Bj.bet();
    Bj.resetCards();
    $('.status').text('Dealing cards...');
    Bj.dealInitialCards(Bj.checkForBlackjack);
  } else alert('You must finish the current hand first.');
};

Bj.gamePlay = function() {
  var cardsDealt = $('.dealerCards .card').length === 2;
  if (!Bj.roundOver && cardsDealt) {
    Bj.choice(Bj.playerCards);
    if ($(this).text() === 'Hit') Bj.hitLogic(Bj.playerCards);
    else if ($(this).text() === 'Stand') Bj.standLogic(Bj.playerCards);
    else if ($(this).text() === 'Double') Bj.doubleLogic(Bj.playerCards);
    else if ($(this).text() === 'Split') Bj.splitLogic();
  } else if ((Bj.split && Bj.stand && !Bj.bustSplit && cardsDealt) || (Bj.split && Bj.bust && !Bj.bustSplit && cardsDealt)) {
    if ($(this).text() === 'Hit') Bj.hitLogic(Bj.playerCardsSplit);
    else if ($(this).text() === 'Stand') Bj.standLogic(Bj.playerCardsSplit);
    else if ($(this).text() === 'Double') {
      Bj.doubleLogic(Bj.playerCardsSplit);
    }
  }
};


// NEW GAME FUNCTIONS
Bj.resetCards = function() {
  Bj.playerCards = [];
  Bj.dealerCards = [];
  Bj.playerCardsSplit =[];
  $('.card').remove();
  $('.status').text('Welcome to Blackjack');
};

function Card(rank, suit, htmlSuit) {
  this.rank = rank;
  this.suit = suit;
  this.score = (!isNaN(rank))? rank : ((rank === 'A')? 1 : 10);
  this.htmlSuit = htmlSuit;
}

Bj.makeDeck = function() {
  Bj.deck = [];
  var ranks = ['A',2,3,4,5,6,7,8,9,10,'J','Q','K'];
  var suits = ['s','h','c','d'];
  var htmlSuits = ['&spades;','&hearts;','&clubs;','&diams;'];
  var numberOfDecks = 1;
  $(ranks).each(function(indexR) {
    $(suits).each(function(indexS) {
      for (var i = 0; i < numberOfDecks; i++) {
        Bj.deck.push(new Card(ranks[indexR], suits[indexS], htmlSuits[indexS]));
      }
    });
  });
  Bj.cardsInShoe = numberOfDecks * 52;
  Bj.cardCount = 0;
  // updateCounter();
  Bj.shuffleDeck();
};

Bj.shuffleDeck = function() {
  var m = Bj.deck.length, t, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = Bj.deck[m];
    Bj.deck[m] = Bj.deck[i];
    Bj.deck[i] = t;
  }
  Bj.shuffledDeck = Bj.deck;
};

Bj.addButtonsAndListeners = function() {
  if ($('.choice').is(':empty')){
    $('.choice').append('<li id="deal">Deal</li>');
    $('.choice').append('<li class="selection">Hit</li><li class="selection">Stand</li><li class="selection">Double</li><li class="selection">Split</li>');
    $('.betting').append('<li id="betLi">Bet: <input id="bet" type="number" value="10"></li>');
    Bj.updateBalance(0);
    $('#deal').click(Bj.deal);
    $('.selection').click(Bj.gamePlay);
  }
};

// DEAL FUNCTIONS
Bj.updateBalance = function(x) {
  if (!Bj.double) Bj.balance = Bj.balance + x;
  else Bj.balance = Bj.balance + 2*x;
  $('.balance').text('Bank balance: ' + Bj.balance);
};

Bj.bet = function() {
  Bj.betSize = parseInt($('#bet').val());
  Bj.updateBalance(-Bj.betSize);
};

Bj.dealInitialCards = function(callback) {
  var i = 0;
  var interval = setInterval(dealCards, 1000);
  function dealCards() {
    Bj.dealCard(Bj.playerCards);
    Bj.dealCard(Bj.dealerCards);
    i++;
    if (i > 1) {
      clearInterval(interval);
      callback();
    }
  }
};

Bj.dealCard = function(array) {
  Bj.checkDeck();
  Bj.newCard = Bj.shuffledDeck.shift();
  array.push(Bj.newCard);
  Bj.updateCounters();
  if (array === Bj.playerCards) {
    $(Bj.cardHTML(Bj.newCard)).appendTo($('.playerCards')).hide().fadeIn(300);
  } else if (array === Bj.dealerCards) {
    if (array.length === 1) {
      $(Bj.cardHTML(Bj.newCard, 'holeCard')).appendTo($('.dealerCards')).hide().fadeIn(300);
      Bj.hideDealerCard();
    } else     $(Bj.cardHTML(Bj.newCard)).appendTo($('.dealerCards')).hide().fadeIn(300);
  } else if (array === Bj.playerCardsSplit) {
    $(Bj.cardHTML(Bj.newCard)).appendTo($('.playerCardsSplit')).hide().fadeIn(300);
  }
};

Bj.checkDeck = function() {
  if (Bj.cardsInShoe === 0) {
    Bj.makeDeck();
    Bj.shuffleDeck();
  }
};

Bj.updateCounters = function() {
  if (Bj.newCard.score >= 2 && Bj.newCard.score < 7) Bj.cardCount++;
  if (Bj.newCard.score === 10) Bj.cardCount--;
  Bj.cardsInShoe--;
  Bj.decksLeft = (Bj.cardsInShoe/52);
  $('#cardsInShoe').text('Cards left in shoe: ' + Bj.cardsInShoe + ' (' + Bj.decksLeft.toFixed(1) + ' decks).');
  $('#count').text('Card count: ' + Bj.cardCount);
  $('#trueCount').text('True count: ' + (Bj.cardCount/Bj.decksLeft).toFixed(1));
};

Bj.cardHTML = function(x, hiddenClass = '') {
  return $('<li class="card rank' + x.rank + ' ' + x.suit + ' ' + hiddenClass + '">' + Bj.newCard.rank + '<br />' + x.htmlSuit + '</li>');
};

Bj.hideDealerCard = function() {
  $('.holeCard').css('color', 'transparent');
};

Bj.checkForBlackjack = function() {
  if (Bj.sumArray(Bj.dealerCards) === 21 && Bj.sumArray(Bj.playerCards) !== 21) {
    Bj.blackjack = true;
    Bj.showDealerCard();
    $('.status').text('Unlucky! Dealer has blackjack - you lose this hand.');
    Bj.roundOver = true;
  } else if (Bj.sumArray(Bj.dealerCards) === 21 && Bj.sumArray(Bj.playerCards) === 21) {
    Bj.blackjack = true;
    Bj.showDealerCard();
    $('.status').text('Both you and the dealer have blackjack! It\'s a draw!');
    Bj.updateBalance(Bj.betSize);
    Bj.roundOver = true;
  } else if (Bj.sumArray(Bj.dealerCards) !== 21 && Bj.sumArray(Bj.playerCards) === 21) {
    Bj.blackjack = true;
    Bj.showDealerCard();
    $('.status').text('Blackjack! You win this hand.');
    Bj.updateBalance(2.5 * Bj.betSize);
    Bj.roundOver = true;
  }
  Bj.choice(Bj.playerCards);
};


// GAME PLAY FUNCTIONS
Bj.choice = function(array, round = 'first') {
  if (Bj.split) {
    $('.status').text('Your ' + round + ' cards are ' + Bj.returnCards(array) + ' - a total of ' + Bj.sumArray(array) + '. What would you like to do?');
  } else if (!Bj.blackjack) {
    $('.status').text('Your cards are ' + Bj.returnCards(array) + ' - a total of ' + Bj.sumArray(array) + '. What would you like to do?');
  }
};

Bj.returnCards = function(array) {
  var newArray = array.map(function(value) {
    return value.rank.toString().concat(value.suit);
  });
  return newArray.join();
};

Bj.sumArray = function(array) {
  var sum = 0;
  var aceCounter = 0;
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
};

Bj.hitLogic = function(array) {
  Bj.dealCard(array);
  if (Bj.sumArray(array) > 21) {
    Bj.busted(array);
  } else {
    Bj.choice(array);
  }
};

Bj.busted = function(array) {
  console.log('reached');
  $('.status').text('BUST! Your cards are ' + Bj.returnCards(array) + ' - a total of ' + Bj.sumArray(array) + '.');
  if (array === Bj.playerCards) {
    Bj.bust = true;
    if  (!Bj.split) {
      Bj.showDealerCard();
      Bj.roundOver = true;
    } else if (Bj.split) Bj.choice(Bj.playerCardsSplit, 'second');
  } else {
    Bj.bustSplit = true;
    Bj.dealerPlays(Bj.determineWinner);
  }
};

Bj.dealerPlays = function(callback) {
  Bj.showDealerCard();
  var i = Bj.sumArray(Bj.dealerCards);
  if (i < 17) var interval = setInterval(dealCards, 1000);
  else if (i >= 17) {
    if (!Bj.split) callback(Bj.playerCards);
    else if (Bj.split && (Bj.bust || Bj.stand)) {
      callback(Bj.playerCards, 'First hand: ');
      callback(Bj.playerCardsSplit, '<br />Second hand: ');
    }
  }
  function dealCards() {
    Bj.dealCard(Bj.dealerCards);
    i = Bj.sumArray(Bj.dealerCards);
    if (i >= 17) {
      clearInterval(interval);
      if (!Bj.split) callback(Bj.playerCards);
      else if (Bj.split && (Bj.bust || Bj.stand)) {
        callback(Bj.playerCards, 'First hand: ');
        callback(Bj.playerCardsSplit, '<br />Second hand: ');
      }
    }
  }
};

Bj.showDealerCard = function() {
  $('.holeCard').css('color', '');
  $('.holeCard').removeClass('holeCard');
};

Bj.determineWinner = function(array, hand = '') {
  if (array !== Bj.playerCardsSplit) $('.status').text('');
  if (Bj.sumArray(array) > 21) {
    $('.status').append(hand + 'Unlucky! You lose this hand. The dealer\'s ' + Bj.sumArray(Bj.dealerCards) + ' beats your busted ' + Bj.sumArray(array) + '. ');
  } else if (Bj.sumArray(array) > Bj.sumArray(Bj.dealerCards) || Bj.sumArray(Bj.dealerCards) > 21) {
    $('.status').append(hand + 'Congratulations! You win this hand - your ' + Bj.sumArray(array) + ' beats the dealer\'s ' + Bj.sumArray(Bj.dealerCards) + '. ');
    Bj.updateBalance(Bj.betSize*2);
  } else if (Bj.sumArray(array) === Bj.sumArray(Bj.dealerCards)) {
    $('.status').append(hand + 'It\'s a draw! Both you and the dealer have ' + Bj.sumArray(array) + '. ');
    Bj.updateBalance(Bj.betSize);
  } else {
    $('.status').append(hand + 'Unlucky! You lose this hand. The dealer\'s ' + Bj.sumArray(Bj.dealerCards) + ' beats your ' + Bj.sumArray(array) + '. ');
  }
  Bj.roundOver = true;
};

Bj.standLogic = function(array) {
  Bj.stand = true;
  if (Bj.split && array === Bj.playerCards) {
    Bj.choice(Bj.playerCardsSplit, 'second');
  } else {
    Bj.dealerPlays(Bj.determineWinner);
  }
};

Bj.doubleLogic = function(array) {
  Bj.updateBalance(-Bj.betSize);
  Bj.double = true;
  Bj.dealCard(array);
  if (Bj.sumArray(array) > 21) {
    Bj.busted(array);
  } else {
    $('.status').text('Your cards are ' + Bj.returnCards(array) + ' - a total of ' + Bj.sumArray(array) + '...');
    Bj.standLogic(array);
  }
};

Bj.splitLogic = function() {
  if ((Bj.playerCards[0].score === Bj.playerCards[1].score) && Bj.playerCards.length === 2) {
    Bj.split = true;
    Bj.updateBalance(-Bj.betSize);
    $('.playerCards').after('<ul class="playerCardsSplit" id="splitBoard"></ul>');
    $('.playerCards .card').eq(1).appendTo('#splitBoard');
    Bj.playerCardsSplit.push(Bj.playerCards.pop());
    Bj.dealCard(Bj.playerCards), Bj.dealCard(Bj.playerCardsSplit);
    Bj.choice(Bj.playerCards, 'first');
  }
};
