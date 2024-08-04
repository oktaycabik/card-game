// src/components/Game.js
import React, { useState, useEffect } from 'react';
import { database } from './firebase';
import { ref, set, onValue, update, push } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid'; // UUID paketini içe aktarın

const Game = () => {
  const [deck, setDeck] = useState([]);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameId, setGameId] = useState(null);
  const [playerId, setPlayerId] = useState(null);

  useEffect(() => {
    const existingPlayerId = localStorage.getItem('playerId');
    const newPlayerId = existingPlayerId || uuidv4(); // UUID oluştur ve kaydet
    localStorage.setItem('playerId', newPlayerId);
    setPlayerId(newPlayerId);

    const gameRef = ref(database, 'games');
    onValue(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        const existingGame = Object.keys(snapshot.val())[0];
        setGameId(existingGame);
        joinGame(existingGame, newPlayerId);
      } else {
        const newGameRef = push(gameRef);
        setGameId(newGameRef.key);
        startNewGame(newGameRef.key, newPlayerId);
      }
    });
  }, []);

  useEffect(() => {
    const newPlayerId = Date.now().toString();
    setPlayerId(newPlayerId);

    const gameRef = ref(database, 'games');
    onValue(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        const existingGame = Object.keys(snapshot.val())[0];
        setGameId(existingGame);
        joinGame(existingGame, newPlayerId);
      } else {
        const newGameRef = push(gameRef);
        setGameId(newGameRef.key);
        startNewGame(newGameRef.key, newPlayerId);
      }
    });
  }, []);

  const startNewGame = (gameId, playerId) => {
    const newDeck = shuffleDeck(generateDeck());
    const deckRef = ref(database, `games/${gameId}`); // deckRef tanımlandı
    set(deckRef, {
      deck: newDeck,
      players: {
        [playerId]: {
          score: 0,
          cards: []
        }
      },
      currentPlayer: playerId,
      gameStarted: false
    });

    setDeck(newDeck);
  };

  const joinGame = (gameId, playerId) => {
    const playerRef = ref(database, `games/${gameId}/players/${playerId}`);
    set(playerRef, {
      score: 0,
      cards: []
    });

    const gameRef = ref(database, `games/${gameId}`);
    onValue(gameRef, (snapshot) => {
      const gameData = snapshot.val();
      setDeck(gameData.deck);
      setPlayers(gameData.players);
      setCurrentPlayer(gameData.currentPlayer);
      setGameStarted(gameData.gameStarted);

      if (Object.keys(gameData.players).length === 2 && !gameData.gameStarted) {
        startGame(gameId);
      }
    });
  };

  const startGame = (gameId) => {
    update(ref(database, `games/${gameId}`), {
      gameStarted: true
    });
  };

  const drawCard = () => {
    if (!gameStarted || deck.length === 0) return;

    const newCard = deck.pop();
    const newPlayers = { ...players };
    newPlayers[currentPlayer].cards.push(newCard);
    newPlayers[currentPlayer].score += newCard;

    setPlayers(newPlayers);
    setDeck(deck);

    update(ref(database, `games/${gameId}`), {
      deck,
      players: newPlayers
    });

    if (newPlayers[currentPlayer].score >= 21 || deck.length === 0) {
      setGameOver(); // Oyun sonu kontrolü
    } else {
      switchTurn();
    }
  };

  const switchTurn = () => {
    const nextPlayer = Object.keys(players).find((id) => id !== currentPlayer);
    update(ref(database, `games/${gameId}`), {
      currentPlayer: nextPlayer
    });
    setCurrentPlayer(nextPlayer);
  };

  const setGameOver = () => {
    update(ref(database, `games/${gameId}`), {
      gameOver: true
    });
  };

  const generateDeck = () => {
    return Array.from({ length: 11 }, (_, i) => i + 1);
  };

  const shuffleDeck = (deck) => {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  };

  return (
    <div>
      <h1>Card Game</h1>
      {gameStarted ? (
        <>
          <h3>Current Player: {players[currentPlayer]?.name || currentPlayer}</h3>
          <div>
            {Object.keys(players).map((id) => (
              <div key={id}>
                <h2>Player {id}</h2>
                <p>Score: {players[id].score}</p>
                <p>Cards: {players[id].cards.join(', ')}</p>
              </div>
            ))}
          </div>
          {currentPlayer === playerId && (
            <button onClick={drawCard}>Draw Card</button>
          )}
        </>
      ) : (
        <p>Waiting for another player to join...</p>
      )}
    </div>
  );
};

export default Game;
