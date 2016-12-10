var rank = ['A',2,3,4,5,6,7,8,9,10,'J','Q','K'];
var suit = ['s','h','c','d'];
var deck = [];
var numberOfDecks = 4;
var playerCards = [], dealerCards = [];
var tens = ['J','Q','K'];
var highCards = ['J','Q','K','A'];
var stand = true, bust = false, blackjack = false;
var cardCount = 0;
var sum, newCard, cardsInShoe, decksLeft, shuffledDeck, aceCounter, balance;

$('#newGame').click(newGame);

function newGame() {
  $('#newGame').css('font-size','12px');
  makeDeck();
  shuffledDeck = shuffle(deck);
  addButtonsAndListeners();
  balance = 1000;
  updateBalance();
  playRound();

  function playRound() {
    resetCards();
    dealInitialCards();
    stand = false, bust = false, blackjack = false;
    checkForBlackjack();
    choice();
  }

  function gamePlay() {
    if (!stand && !bust && !blackjack) {
      choice();
      if ($(this).text() === 'Hit') {
        hitLogic();
      } else if ($(this).text() === 'Stand') {
        standLogic();
      }
    }
  }

  function makeDeck() {
    $(rank).each(function(indexR, valueR) {
      $(suit).each(function(indexS, valueS) {
        for (var i = 0; i < numberOfDecks; i++) {
          deck.push(valueR + suit[indexS]);
        }
      });
    });
    cardsInShoe = numberOfDecks * 52;
    cardCounter = 0;
    updateCounter();
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

  function addButtonsAndListeners() {
    if ($('.choice').is(':empty')){
      $('.choice').append('<li class="selection" id="playNextHand">Play Next Hand</li>');
      $('.choice').append('<li class="selection">Hit</li><li class="selection">Stand</li>');
      $('.betting').append('<li id="betLi">Bet: <input id="bet" type="number" value="10"></li>');
      $('#playNextHand').click(playRound);
      $('.selection').click(gamePlay);
    }
  }

  function resetCards() {
    playerCards = [];
    dealerCards = [];
    $('.card').remove();
  }

  function dealInitialCards() {
    dealCard(playerCards);
    dealCard(dealerCards);
    dealCard(playerCards);
    dealCard(dealerCards);
  }

  function dealCard(x) {
    if (cardsInShoe === 0) {
      makeDeck();
      shuffledDeck = shuffle(deck);
    }
    newCard = shuffledDeck.shift();
    x.push(newCard);
    if (parseInt(newCard) >= 2 && parseInt(newCard) < 7) cardCount++;
    if (highCards.indexOf(newCard.charAt(0)) !== -1) cardCount--;
    cardsInShoe--;
    updateCounter();
    if (x === playerCards) {
      $('.playerCards').append('<li class="card">' + newCard + '</li>');
    } else if (x === dealerCards) {
      $('.dealerCards').append('<li class="card">' + newCard + '</li>');
    }
  }

  function sumArray(array) {
    sum = 0;
    aceCounter = 0;
    $(array).each(function(index, value) {
      if (tens.indexOf(value.charAt(0)) !== -1) value = 10;
      if (value.toString().includes('A')) {
        aceCounter++;
        value = 11;
      }
      sum += parseInt(value);
    });
    for (var i=1  ; i <= aceCounter; i++) {
      if (sum > 21 && aceCounter >=i) sum -= 10;
    }
    return sum;
  }

  function checkForBlackjack() {
    if (sumArray(dealerCards) === 21 && sumArray(playerCards) !== 21) {
      blackjack = true;
      $('.status').text('Unlucky! Dealer has blackjack - you lose this hand.');
    } else if (sumArray(dealerCards) === 21 && sumArray(playerCards) === 21) {
      blackjack = true;
      $('.status').text('Both you and the dealer have blackjack! It\'s a draw!');
    } else if (sumArray(dealerCards) !== 21 && sumArray(playerCards) === 21) {
      blackjack = true;
      $('.status').text('Blackjack! You win this hand.');
    }
  }

  function choice() {
    if (!blackjack) {
      $('.status').text('Your cards are ' + playerCards.join() + ' - a total of ' + sumArray(playerCards) + '. What would you like to do?');
    }
  }

  function hitLogic() {
    dealCard(playerCards);
    if (sumArray(playerCards) > 21) {
      busted();
    } else {
      choice();
    }
  }

  function busted() {
    $('.status').text('BUST! Your cards are ' + playerCards.join() + ' - a total of ' + sumArray(playerCards) + '.');
    bust = true;
  }

  function standLogic() {
    stand = true;
    while (sumArray(dealerCards) < 17) {
      dealCard(dealerCards);
    }
    determineWinner();
  }

  function determineWinner() {
    if (sumArray(playerCards) > sumArray(dealerCards) || sumArray(dealerCards) > 21) {
      $('.status').text('Congratulations! You win this hand. The dealer\'s cards are ' + dealerCards.join() + ' - a total of ' + sumArray(dealerCards));
    } else if (sumArray(playerCards) === sumArray(dealerCards)) {
      $('.status').text('It\'s a draw! The dealer\'s cards are ' + dealerCards.join() + ' - a total of ' + sumArray(dealerCards));
    } else {
      $('.status').text('Unlucky! You lose this hand. The dealer\'s cards are ' + dealerCards.join() + ' - a total of ' + sumArray(dealerCards));
    }
  }

  function updateCounter() {
    decksLeft = (cardsInShoe/52);
    $('#cardsInShoe').text('Cards left in shoe: ' + cardsInShoe + ' (' + decksLeft.toFixed(1) + ' decks).');
    $('#count').text('Card count: ' + cardCount);
    $('#trueCount').text('True count: ' + (cardCount/decksLeft).toFixed(1));
  }

  function updateBalance() {
    $('#balance').text(balance);
  }
}
