var rank = ['A',2,3,4,5,6,7,8,9,10,'J','Q','K'];
var suit = ['s','h','c','d'];
var deck = [];
var numberOfDecks = 1;
var playerCards = [];
var dealerCards = [];
var move;
var tens = ['A','J','Q','K'];
var sum;
var playAgain = true;




makeDeck();
var shuffledDeck = shuffle(deck);
while (playAgain === true) playRound();

function playRound() {
  // deal cards
  dealCard(playerCards);
  dealCard(dealerCards);
  dealCard(playerCards);
  dealCard(dealerCards);


  $('.selection').click(function() {
    move = $(this).text();
  });


  // show cards, ask player what he wants to do
  choice();
  while (move === 'HIT' || move === 'H') {
    dealCard(playerCards);
    if (sumArray(playerCards) > 21) {
      move = 'bust';
      alert('BUST! Your cards are ' + playerCards.join() + ' - a total of ' + sumArray(playerCards) + '.');
      resetCards();
    } else {
      choice();
    }
  }
  if (move === 'STICK' || move === 'S') {
    while (sumArray(dealerCards) < 17) {
      dealCard(dealerCards);
    }
    alert('The dealer\'s cards are ' + dealerCards.join() + ' - a total of ' + sumArray(dealerCards) + '. ' + determineWinner());
    resetCards();
  }
  function resetCards() {
    playerCards = [];
    dealerCards = [];
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
}


function shuffle(array) {
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

function dealCard(x) {
  x.push(shuffledDeck.shift());
  if (x === playerCards) {
    $('.playerCards').append('<li class="card"></li>');
  } else if (x === dealerCards) {
    $('.dealerCards').append('<li class="card"></li>');
  }
}

function choice() {
  $('.status').text('Your cards are ' + playerCards.join() + ' - a total of ' + sumArray(playerCards) + '. What would you like to do?');
}

function sumArray(array) {
  sum = 0;
  $(array).each(function(index, value) {
    if (tens.indexOf((value.charAt(0))) !== -1) value = 10;
    sum += parseInt(value);
  });
  return sum;
}

function determineWinner() {
  if (sumArray(playerCards) > sumArray(dealerCards) || sumArray(dealerCards) > 21) {
    return 'Congratulations! You win this hand';
  } else if (sumArray(playerCards) === sumArray(dealerCards)) {
    return 'It\'s a draw!';
  } else {
    return 'Unlucky! You lose this hand';
  }
}
