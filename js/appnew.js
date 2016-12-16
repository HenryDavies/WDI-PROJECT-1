var Game = Game || {};

$(function() {
  $('#newGame').click(Game.newGame);
  Game.showCount = false;
});

Game.newGame = function() {
  Game.balance = 1000;
  Game.updateBalance(0);
  Game.roundOver = Game.dealerFinished = true;
  Game.resetCards();
  Game.makeDeck();
  Game.shuffleDeck();
  Game.addDeckToTable();
  Game.addButtonsAndListeners();
  if (Game.showCount) {
    if (Game.cardCount) $('#trueCount p').text((Game.cardCount/Game.decksLeft).toFixed(1));
    else $('#trueCount p').text(0);
  }
};

Game.deal = function() {
  if (Game.roundOver && Game.dealerFinished) {
    Game.roundOver = Game.secondRoundOver = Game.double = Game.split = Game.dealerFinished = false;
    Game.bet();
    if (Game.sufficientFunds) {
      Game.resetCards();
      $('.status').text('Dealing cards...');
      Game.dealInitialCards(Game.checkForBlackjack);
    } else if (!Game.sufficientFunds) {
      Game.roundOver = Game.dealerFinished = true;
    }
  } else alert('You must finish the current hand first.');
};

Game.gamePlay = function() {
  var cardsDealt = $('.dealerCards .card').length === 2;
  if (!Game.roundOver && cardsDealt) {
    Game.choice(Game.playerCards);
    if ($(this).text() === 'Hit') Game.hitLogic(Game.playerCards);
    else if ($(this).text() === 'Stand') Game.standLogic(Game.playerCards);
    else if ($(this).text() === 'Double') Game.doubleLogic(Game.playerCards);
    else if ($(this).text() === 'Split' && !Game.split) Game.splitLogic();
  } else if (Game.roundOver && Game.split && cardsDealt && !Game.secondRoundOver) {
    if ($(this).text() === 'Hit') Game.hitLogic(Game.playerCardsSplit);
    else if ($(this).text() === 'Stand') Game.standLogic(Game.playerCardsSplit);
    else if ($(this).text() === 'Double') {
      Game.doubleLogic(Game.playerCardsSplit);
    }
  }
};


// NEW GAME FUNCTIONS
Game.resetCards = function() {
  Game.playerCards = [];
  Game.dealerCards = [];
  Game.playerCardsSplit =[];
  $('.playerCardsSplit').remove();
  $('.card').remove();
  $('.status').text('Welcome to Blackjack');
};

function Card(rank, suit, htmlSuit) {
  this.rank = rank;
  this.suit = suit;
  this.score = (!isNaN(rank))? rank : ((rank === 'A')? 1 : 10);
  this.htmlSuit = htmlSuit;
}

Game.makeDeck = function() {
  Game.deck = [];
  var ranks = ['A',2,3,4,5,6,7,8,9,10,'J','Q','K'];
  var suits = ['s','h','c','d'];
  var htmlSuits = ['&spades;','&hearts;','&clubs;','&diams;'];
  var numberOfDecks = 4;
  $(ranks).each(function(indexR) {
    $(suits).each(function(indexS) {
      for (var i = 0; i < numberOfDecks; i++) {
        Game.deck.push(new Card(ranks[indexR], suits[indexS], htmlSuits[indexS]));
      }
    });
  });
  Game.cardsInShoe = numberOfDecks * 52;
  Game.cardCount = 0;
  Game.shuffleDeck();
};

Game.shuffleDeck = function() {
  var m = Game.deck.length, t, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = Game.deck[m];
    Game.deck[m] = Game.deck[i];
    Game.deck[i] = t;
  }
  Game.shuffledDeck = Game.deck;
};

Game.addDeckToTable = function() {
  $('#shoe').empty();
  $(Game.shuffledDeck).each(function(index, value) {
    $(Game.cardHTML(value)).appendTo($('#shoe')).css({'position': 'absolute','top': 35+index/50,'left': 87+index/50}).addClass('shoeCards').removeClass('card');
  });
};

Game.addButtonsAndListeners = function() {
  if ($('.choice').is(':empty')){
    $('.choice').append('<li id="deal">Deal</li>');
    $('.choice').append('<li class="selection">Hit</li><li class="selection">Stand</li><li class="selection">Double</li><li class="selection">Split</li>');
    $('.betting').append('<li id="betLi">Bet: <input id="bet" type="number" value="10"></li>');
    $('#counter').append('<li id="trueCount"><p>Show/hide card count</p></li>');
    Game.updateBalance(0);
    $('#deal').click(Game.deal);
    $('.selection').click(Game.gamePlay);
    $('#trueCount').click(Game.displayCounter);
  }
};

Game.displayCounter = function() {
  Game.showCount = !Game.showCount;
  if (Game.showCount) {
    if (Game.cardCount) $('#trueCount p').text((Game.cardCount/Game.decksLeft).toFixed(1)).css('font-size', '50px');
    else $('#trueCount p').text(0).css('font-size', '50px');
  } else {
    $('#trueCount p').text('Show/hide card count').css('font-size', '16px');
  }
};


// DEAL FUNCTIONS
Game.updateBalance = function(x) {
  if (!Game.double) Game.balance = Game.balance + x;
  else Game.balance = Game.balance + 2*x;
  $('.balance').text('Bank balance: ' + Game.balance);
};

Game.bet = function() {
  Game.betSize = parseInt($('#bet').val());
  if (Game.balance === 0) {
    $('.status').text('Game over! You are out of funds.');
    Game.sufficientFunds = false;
  } else if (Game.betSize > Game.balance) {
    $('.status').text('Insufficient funds! Reduce your bet size.');
    Game.sufficientFunds = false;
  } else {
    Game.sufficientFunds = true;
    Game.updateBalance(-Game.betSize);
  }
};

Game.dealInitialCards = function(callback) {
  var i = 0;
  var interval = setInterval(function() {
    var x = (i % 2 === 0)? Game.playerCards : Game.dealerCards;
    Game.dealCard(x);
    i++;
    if (i > 3) {
      clearInterval(interval);
      callback();
    }
  }, 500);
};

Game.dealCard = function(array) {
  new Audio('./Sounds/cardPlace1.wav').play();
  Game.checkDeck();
  Game.newCard = Game.shuffledDeck.shift();
  array.push(Game.newCard);
  Game.updateCounters();
  if (array === Game.playerCards) {
    Game.moveAnimate($('.shoeCards:nth-child(1)'), $('.playerCards'));
  } else if (array === Game.dealerCards) {
    if (array.length === 1) {
      $('.shoeCards:nth-child(1)').addClass('holeCard');
      Game.moveAnimate($('.shoeCards:nth-child(1)'), $('.dealerCards'), Game.hideDealerCard);
    } else Game.moveAnimate($('.shoeCards:nth-child(1)'), $('.dealerCards'));
  } else if (array === Game.playerCardsSplit) {
    Game.moveAnimate($('.shoeCards:nth-child(1)'), $('.playerCardsSplit'));
  }
};

Game.checkDeck = function() {
  if (Game.cardsInShoe === 0) {
    Game.makeDeck();
    Game.shuffleDeck();
    Game.addDecktoTable();
  }
};

Game.updateCounters = function() {
  if (!(Game.dealerCards.length === 1 && Game.playerCards.length === 1)) {
    console.log(Game.newCard);
    if (Game.newCard.score >= 2 && Game.newCard.score < 7) {
      Game.cardCount++;
      console.log(Game.cardCount);
    }
    if (Game.newCard.score === 10 || Game.newCard.score === 1) {
      Game.cardCount--;
      console.log(Game.cardCount);
    }
  }
  Game.cardsInShoe--;
  Game.decksLeft = (Game.cardsInShoe/52);
  if (Game.showCount) {
    if (Game.cardCount) $('#trueCount p').text((Game.cardCount/Game.decksLeft).toFixed(1));
    else $('#trueCount p').text(0);
  }
};

Game.cardHTML = function(x, hiddenClass = '') {
  return $('<li class="card rank' + x.rank + ' ' + x.suit + ' ' +  hiddenClass + '">' + x.rank + '<br />' + x.htmlSuit + '</li>');
};

Game.hideDealerCard = function() {
  $('.holeCard').css('color', 'transparent');
};

Game.checkForBlackjack = function() {
  if (Game.sumArray(Game.dealerCards) === 21 && Game.sumArray(Game.playerCards) !== 21) {
    Game.showDealerCard();
    $('.status').text('Unlucky! Dealer has blackjack - you lose this hand.');
    Game.roundOver = Game.dealerFinished = true;
  } else if (Game.sumArray(Game.dealerCards) === 21 && Game.sumArray(Game.playerCards) === 21) {
    Game.showDealerCard();
    $('.status').text('Both you and the dealer have blackjack! It\'s a draw!');
    Game.updateBalance(Game.betSize);
    Game.roundOver = Game.dealerFinished = true;
  } else if (Game.sumArray(Game.dealerCards) !== 21 && Game.sumArray(Game.playerCards) === 21) {
    Game.showDealerCard();
    $('.status').text('Blackjack! You win this hand.');
    Game.updateBalance(2.5 * Game.betSize);
    Game.roundOver = Game.dealerFinished = true;
  }
  Game.choice(Game.playerCards);
};


// GAME PLAY FUNCTIONS
Game.choice = function(array, round = 'first') {
  if (Game.split) {
    $('.status').text('Your ' + round + ' cards are ' + Game.returnCards(array) + ' - a total of ' + Game.sumArray(array) + '. What would you like to do?');
  } else if (!Game.roundOver) {
    $('.status').text('Your cards are ' + Game.returnCards(array) + ' - a total of ' + Game.sumArray(array) + '. What would you like to do?');
  }
};

Game.returnCards = function(array) {
  var newArray = array.map(function(value) {
    return value.rank.toString().concat(value.suit);
  });
  return newArray.join();
};

Game.sumArray = function(array) {
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

Game.hitLogic = function(array) {
  Game.dealCard(array);
  if (Game.sumArray(array) > 21) {
    Game.busted(array);
  } else {
    Game.choice(array);
  }
};

Game.busted = function(array) {
  $('.status').text('BUST! Your cards are ' + Game.returnCards(array) + ' - a total of ' + Game.sumArray(array) + '.');
  Game.roundOver = Game.dealerFinished = true;
  if (array === Game.playerCards && !Game.split) {
    Game.showDealerCard();
  } else if (array === Game.playerCards && Game.split) {
    Game.choice(Game.playerCardsSplit, 'second');
  } else if (array === Game.playerCardsSplit) {
    Game.secondRoundOver === true;
    Game.dealerPlays(Game.determineWinner);
  }
};

Game.dealerPlays = function(callback) {
  Game.showDealerCard();
  var i = Game.sumArray(Game.dealerCards);
  if (i < 17) var interval = setInterval(dealCards, 1000);
  else if (i >= 17) {
    if (!Game.split) callback(Game.playerCards);
    else if (Game.split && Game.roundOver) {
      callback(Game.playerCards, 'First hand: ');
      callback(Game.playerCardsSplit, '<br />Second hand: ');
    }
    Game.dealerFinished = true;
  }
  function dealCards() {
    Game.dealCard(Game.dealerCards);
    i = Game.sumArray(Game.dealerCards);
    if (i >= 17) {
      clearInterval(interval);
      if (!Game.split) callback(Game.playerCards);
      else if (Game.split && Game.roundOver) {
        callback(Game.playerCards, 'First hand: ');
        callback(Game.playerCardsSplit, '<br />Second hand: ');
      }
      Game.dealerFinished = true;
    }
  }
};

Game.showDealerCard = function() {
  $('.holeCard').css('color', '');
  $('.holeCard').removeClass('holeCard');
  if (Game.dealerCards[0].score >= 2 && Game.dealerCards[0].score < 7) Game.cardCount++;
  if (Game.dealerCards[0].score === 10 || Game.dealerCards[0].score === 11) Game.cardCount--;
  if (Game.showCount) {
    if (Game.cardCount) {
      $('#trueCount p').text((Game.cardCount/Game.decksLeft).toFixed(1));
    } else $('#trueCount p').text(0);
  }
};


Game.determineWinner = function(array, hand = '') {
  if (array !== Game.playerCardsSplit) $('.status').text('');
  if (Game.sumArray(array) > 21) {
    $('.status').append(hand + 'Unlucky! You lose this hand. The dealer\'s ' + Game.sumArray(Game.dealerCards) + ' beats your busted ' + Game.sumArray(array) + '. ');
  } else if (Game.sumArray(array) > Game.sumArray(Game.dealerCards) || Game.sumArray(Game.dealerCards) > 21) {
    $('.status').append(hand + 'Congratulations! You win this hand - your ' + Game.sumArray(array) + ' beats the dealer\'s ' + Game.sumArray(Game.dealerCards) + '. ');
    Game.updateBalance(Game.betSize*2);
  } else if (Game.sumArray(array) === Game.sumArray(Game.dealerCards)) {
    $('.status').append(hand + 'It\'s a draw! Both you and the dealer have ' + Game.sumArray(array) + '. ');
    Game.updateBalance(Game.betSize);
  } else {
    $('.status').append(hand + 'Unlucky! You lose this hand. The dealer\'s ' + Game.sumArray(Game.dealerCards) + ' beats your ' + Game.sumArray(array) + '. ');
  }
};

Game.standLogic = function(array) {
  Game.roundOver = true;
  if (!Game.split) {
    Game.dealerPlays(Game.determineWinner);
  } else if (Game.split && array === Game.playerCards) {
    Game.choice(Game.playerCardsSplit, 'second');
  } else if (Game.split && array === Game.playerCardsSplit) {
    Game.secondRoundOver = true;
    Game.dealerPlays(Game.determineWinner);
  }
};

Game.doubleLogic = function(array) {
  if (Game.betSize <= Game.balance) {
    Game.updateBalance(-Game.betSize);
    Game.double = Game.roundOver = true;
    if (array === Game.playerCardsSplit) Game.secondRoundOver = true;
    Game.dealCard(array);
    if (Game.sumArray(array) > 21) {
      Game.busted(array);
    } else {
      $('.status').text('Your cards are ' + Game.returnCards(array) + ' - a total of ' + Game.sumArray(array) + '...');
      Game.standLogic(array);
    }
  } else $('.status').text('Insufficient funds to double your bet');
};

Game.splitLogic = function() {
  if ((Game.playerCards[0].score === Game.playerCards[1].score) && Game.playerCards.length === 2) {
    if (Game.betSize <= Game.balance) {
      Game.split = true;
      Game.updateBalance(-Game.betSize);
      $('.playerCards').after('<ul class="playerCardsSplit" id="playerCardsSplit"></ul>');
      $('.playerCards .card').eq(1).appendTo('.playerCardsSplit');
      Game.playerCardsSplit.push(Game.playerCards.pop());
      Game.dealCard(Game.playerCards), Game.dealCard(Game.playerCardsSplit);
      Game.choice(Game.playerCards, 'first');
    } else $('.status').text('Insufficient funds to split');
  }
};

Game.moveAnimate = function(element, newParent, callback=''){
  element = $(element);
  newParent= $(newParent);

  element.css({'position': 'relative', 'top': 0, 'left': 0});

  var oldOffset = element.offset();
  element.appendTo(newParent);
  var newOffset = element.offset();

  var temp = element.clone().appendTo('body');
  temp.css({
    'position': 'absolute',
    'left': oldOffset.left,
    'top': oldOffset.top,
    'z-index': 500
  });
  element.hide();
  temp.animate({'top': newOffset.top, 'left': newOffset.left}, 'slow', function(){
    element.show();
    temp.remove();
  });
  element.removeClass('shoeCards').addClass('card');
  if (callback !== '') {
    callback();
  }
};
