var Bj = Bj || {};

$(function() {
  $('#newGame').click(Bj.newGame);
  Bj.showCount = false;
});

Bj.newGame = function() {
  Bj.balance = 1000;
  Bj.updateBalance(0);
  Bj.roundOver = Bj.dealerFinished = true;
  Bj.resetCards();
  Bj.makeDeck();
  Bj.shuffleDeck();
  Bj.addDeckToTable();
  Bj.addButtonsAndListeners();
  if (Bj.showCount) {
    if (Bj.cardCount) $('#trueCount p').text((Bj.cardCount/Bj.decksLeft).toFixed(1));
    else $('#trueCount p').text(0);
  }
};

Bj.deal = function() {
  if (Bj.roundOver && Bj.dealerFinished) {
    Bj.roundOver = Bj.secondRoundOver = Bj.double = Bj.split = Bj.dealerFinished = false;
    Bj.bet();
    if (Bj.sufficientFunds) {
      Bj.resetCards();
      $('.status').text('Dealing cards...');
      Bj.dealInitialCards(Bj.checkForBlackjack);
    } else if (!Bj.sufficientFunds) {
      Bj.roundOver = Bj.dealerFinished = true;
    }
  } else alert('You must finish the current hand first.');
};

Bj.gamePlay = function() {
  var cardsDealt = $('.dealerCards .card').length === 2;
  if (!Bj.roundOver && cardsDealt) {
    Bj.choice(Bj.playerCards);
    if ($(this).text() === 'Hit') Bj.hitLogic(Bj.playerCards);
    else if ($(this).text() === 'Stand') Bj.standLogic(Bj.playerCards);
    else if ($(this).text() === 'Double') Bj.doubleLogic(Bj.playerCards);
    else if ($(this).text() === 'Split' && !Bj.split) Bj.splitLogic();
  } else if (Bj.roundOver && Bj.split && cardsDealt && !Bj.secondRoundOver) {
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

Bj.makeDeck = function() {
  Bj.deck = [];
  var ranks = ['A',2,3,4,5,6,7,8,9,10,'J','Q','K'];
  var suits = ['s','h','c','d'];
  var htmlSuits = ['&spades;','&hearts;','&clubs;','&diams;'];
  var numberOfDecks = 4;
  $(ranks).each(function(indexR) {
    $(suits).each(function(indexS) {
      for (var i = 0; i < numberOfDecks; i++) {
        Bj.deck.push(new Card(ranks[indexR], suits[indexS], htmlSuits[indexS]));
      }
    });
  });
  Bj.cardsInShoe = numberOfDecks * 52;
  Bj.cardCount = 0;
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

Bj.addDeckToTable = function() {
  $('#shoe').empty();
  $(Bj.shuffledDeck).each(function(index, value) {
    $(Bj.cardHTML(value)).appendTo($('#shoe')).css({'position': 'absolute','top': 35+index/50,'left': 87+index/50}).addClass('shoeCards').removeClass('card');
  });
};

Bj.addButtonsAndListeners = function() {
  if ($('.choice').is(':empty')){
    $('.choice').append('<li id="deal">Deal</li>');
    $('.choice').append('<li class="selection">Hit</li><li class="selection">Stand</li><li class="selection">Double</li><li class="selection">Split</li>');
    $('.betting').append('<li id="betLi">Bet: <input id="bet" type="number" value="10"></li>');
    $('#counter').append('<li id="trueCount"><p>Show/hide card count</p></li>');
    Bj.updateBalance(0);
    $('#deal').click(Bj.deal);
    $('.selection').click(Bj.gamePlay);
    $('#trueCount').click(Bj.displayCounter);
  }
};

Bj.displayCounter = function() {
  Bj.showCount = !Bj.showCount;
  if (Bj.showCount) {
    if (Bj.cardCount) $('#trueCount p').text((Bj.cardCount/Bj.decksLeft).toFixed(1)).css('font-size', '50px');
    else $('#trueCount p').text(0).css('font-size', '50px');
  } else {
    $('#trueCount p').text('Show/hide card count').css('font-size', '16px');
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
  if (Bj.balance === 0) {
    $('.status').text('Game over! You are out of funds.');
    Bj.sufficientFunds = false;
  } else if (Bj.betSize > Bj.balance) {
    $('.status').text('Insufficient funds! Reduce your bet size.');
    Bj.sufficientFunds = false;
  } else {
    Bj.sufficientFunds = true;
    Bj.updateBalance(-Bj.betSize);
  }
};

Bj.dealInitialCards = function(callback) {
  var i = 0;
  var interval = setInterval(function() {
    var x = (i % 2 === 0)? Bj.playerCards : Bj.dealerCards;
    Bj.dealCard(x);
    i++;
    if (i > 3) {
      clearInterval(interval);
      callback();
    }
  }, 500);
};

Bj.dealCard = function(array) {
  new Audio('./Sounds/cardPlace1.wav').play();
  Bj.checkDeck();
  Bj.newCard = Bj.shuffledDeck.shift();
  array.push(Bj.newCard);
  Bj.updateCounters();
  if (array === Bj.playerCards) {
    Bj.moveAnimate($('.shoeCards:nth-child(1)'), $('.playerCards'));
  } else if (array === Bj.dealerCards) {
    if (array.length === 1) {
      $('.shoeCards:nth-child(1)').addClass('holeCard');
      Bj.moveAnimate($('.shoeCards:nth-child(1)'), $('.dealerCards'), Bj.hideDealerCard);
    } else Bj.moveAnimate($('.shoeCards:nth-child(1)'), $('.dealerCards'));
  } else if (array === Bj.playerCardsSplit) {
    Bj.moveAnimate($('.shoeCards:nth-child(1)'), $('.playerCardsSplit'));
  }
};

Bj.checkDeck = function() {
  if (Bj.cardsInShoe === 0) {
    Bj.makeDeck();
    Bj.shuffleDeck();
    Bj.addDecktoTable();
  }
};

Bj.updateCounters = function() {
  if (!(Bj.dealerCards.length === 1 && Bj.playerCards.length === 1)) {
    console.log(Bj.newCard);
    if (Bj.newCard.score >= 2 && Bj.newCard.score < 7) {
      Bj.cardCount++;
      console.log(Bj.cardCount);
    }
    if (Bj.newCard.score === 10 || Bj.newCard.score === 1) {
      Bj.cardCount--;
      console.log(Bj.cardCount);
    }
  }
  Bj.cardsInShoe--;
  Bj.decksLeft = (Bj.cardsInShoe/52);
  if (Bj.showCount) {
    if (Bj.cardCount) $('#trueCount p').text((Bj.cardCount/Bj.decksLeft).toFixed(1));
    else $('#trueCount p').text(0);
  }
};

Bj.cardHTML = function(x, hiddenClass = '') {
  return $('<li class="card rank' + x.rank + ' ' + x.suit + ' ' +  hiddenClass + '">' + x.rank + '<br />' + x.htmlSuit + '</li>');
};

Bj.hideDealerCard = function() {
  $('.holeCard').css('color', 'transparent');
};

Bj.checkForBlackjack = function() {
  if (Bj.sumArray(Bj.dealerCards) === 21 && Bj.sumArray(Bj.playerCards) !== 21) {
    Bj.showDealerCard();
    $('.status').text('Unlucky! Dealer has blackjack - you lose this hand.');
    Bj.roundOver = Bj.dealerFinished = true;
  } else if (Bj.sumArray(Bj.dealerCards) === 21 && Bj.sumArray(Bj.playerCards) === 21) {
    Bj.showDealerCard();
    $('.status').text('Both you and the dealer have blackjack! It\'s a draw!');
    Bj.updateBalance(Bj.betSize);
    Bj.roundOver = Bj.dealerFinished = true;
  } else if (Bj.sumArray(Bj.dealerCards) !== 21 && Bj.sumArray(Bj.playerCards) === 21) {
    Bj.showDealerCard();
    $('.status').text('Blackjack! You win this hand.');
    Bj.updateBalance(2.5 * Bj.betSize);
    Bj.roundOver = Bj.dealerFinished = true;
  }
  Bj.choice(Bj.playerCards);
};


// GAME PLAY FUNCTIONS
Bj.choice = function(array, round = 'first') {
  if (Bj.split) {
    $('.status').text('Your ' + round + ' cards are ' + Bj.returnCards(array) + ' - a total of ' + Bj.sumArray(array) + '. What would you like to do?');
  } else if (!Bj.roundOver) {
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
  $('.status').text('BUST! Your cards are ' + Bj.returnCards(array) + ' - a total of ' + Bj.sumArray(array) + '.');
  Bj.roundOver = Bj.dealerFinished = true;
  if (array === Bj.playerCards && !Bj.split) {
    Bj.showDealerCard();
  } else if (array === Bj.playerCards && Bj.split) {
    Bj.choice(Bj.playerCardsSplit, 'second');
  } else if (array === Bj.playerCardsSplit) {
    Bj.secondRoundOver === true;
    Bj.dealerPlays(Bj.determineWinner);
  }
};

Bj.dealerPlays = function(callback) {
  Bj.showDealerCard();
  var i = Bj.sumArray(Bj.dealerCards);
  if (i < 17) var interval = setInterval(dealCards, 1000);
  else if (i >= 17) {
    if (!Bj.split) callback(Bj.playerCards);
    else if (Bj.split && Bj.roundOver) {
      callback(Bj.playerCards, 'First hand: ');
      callback(Bj.playerCardsSplit, '<br />Second hand: ');
    }
    Bj.dealerFinished = true;
  }
  function dealCards() {
    Bj.dealCard(Bj.dealerCards);
    i = Bj.sumArray(Bj.dealerCards);
    if (i >= 17) {
      clearInterval(interval);
      if (!Bj.split) callback(Bj.playerCards);
      else if (Bj.split && Bj.roundOver) {
        callback(Bj.playerCards, 'First hand: ');
        callback(Bj.playerCardsSplit, '<br />Second hand: ');
      }
      Bj.dealerFinished = true;
    }
  }
};

Bj.showDealerCard = function() {
  $('.holeCard').css('color', '');
  $('.holeCard').removeClass('holeCard');
  if (Bj.dealerCards[0].score >= 2 && Bj.dealerCards[0].score < 7) Bj.cardCount++;
  if (Bj.dealerCards[0].score === 10 || Bj.dealerCards[0].score === 11) Bj.cardCount--;
  if (Bj.showCount) {
    if (Bj.cardCount) {
      $('#trueCount p').text((Bj.cardCount/Bj.decksLeft).toFixed(1));
    } else $('#trueCount p').text(0);
  }
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
};

Bj.standLogic = function(array) {
  Bj.roundOver = true;
  if (!Bj.split) {
    Bj.dealerPlays(Bj.determineWinner);
  } else if (Bj.split && array === Bj.playerCards) {
    Bj.choice(Bj.playerCardsSplit, 'second');
  } else if (Bj.split && array === Bj.playerCardsSplit) {
    Bj.secondRoundOver = true;
    Bj.dealerPlays(Bj.determineWinner);
  }
};

Bj.doubleLogic = function(array) {
  if (Bj.betSize <= Bj.balance) {
    Bj.updateBalance(-Bj.betSize);
    Bj.double = Bj.roundOver = true;
    if (array === Bj.playerCardsSplit) Bj.secondRoundOver = true;
    Bj.dealCard(array);
    if (Bj.sumArray(array) > 21) {
      Bj.busted(array);
    } else {
      $('.status').text('Your cards are ' + Bj.returnCards(array) + ' - a total of ' + Bj.sumArray(array) + '...');
      Bj.standLogic(array);
    }
  } else $('.status').text('Insufficient funds to double your bet');
};

Bj.splitLogic = function() {
  if ((Bj.playerCards[0].score === Bj.playerCards[1].score) && Bj.playerCards.length === 2) {
    if (Bj.betSize <= Bj.balance) {
      Bj.split = true;
      Bj.updateBalance(-Bj.betSize);
      $('.playerCards').after('<ul class="playerCardsSplit" id="playerCardsSplit"></ul>');
      $('.playerCards .card').eq(1).appendTo('.playerCardsSplit');
      Bj.playerCardsSplit.push(Bj.playerCards.pop());
      Bj.dealCard(Bj.playerCards), Bj.dealCard(Bj.playerCardsSplit);
      Bj.choice(Bj.playerCards, 'first');
    } else $('.status').text('Insufficient funds to split');
  }
};

Bj.moveAnimate = function(element, newParent, callback=''){
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
