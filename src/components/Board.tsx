'use client'
import { useState } from 'react';
import { BaseError } from 'viem'
import { useNetwork, useContractWrite, useWaitForTransaction } from 'wagmi'

import { tictactoeConfigPolygon, tictactoeConfigOptimism } from './contracts'
import { stringify } from '../utils/stringify'



const MAX_POLL_ATTEMPTS = 5;


interface SquareProps {
  value: string;
  onSquareClick: () => void;
}

function Square({ value, onSquareClick }: SquareProps) {
  return (
    <button
      className={`square flex justify-center items-center border-2 border-gray-400 h-24 w-24 md:h-32 md:w-32 focus:outline-none ${
        value ? (value === 'X' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white') : 'bg-gray-200'
      }`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

interface BoardProps {
  xIsNext: boolean;
  squares: string[];
  onPlay: (squares: string[]) => void;
}

function Board({ xIsNext, squares, onPlay }: BoardProps) {
  function handleClick(i: number) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <>
      <div className="status text-3xl font-semibold mb-4">{status}</div>
      <div className="grid grid-cols-3 gap-2">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState<string[][]>([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  const winner = calculateWinner(currentSquares);
  const isGameCompleted = winner || history.length === 10;
  const { chain, chains } = useNetwork()

  const { write, data, error, isLoading, isError } = useContractWrite(
    chain?.name === "polygon" ? {
      ...tictactoeConfigPolygon,
      functionName: 'mint',
    } : {
      ...tictactoeConfigOptimism,
      functionName: 'mint',
    }
  )

  const {
    data: receipt,
    isLoading: isPending,
    isSuccess,
  } = useWaitForTransaction({ hash: data?.hash })

  function handlePlay(nextSquares: string[]): void {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);

  }

  function jumpTo(nextMove: number): void {
    setCurrentMove(nextMove);
  }


  function saveGameState(): any {
    // Determine the outcome of the game
    const winner: string | null  = calculateWinner(currentSquares);
    let outcome: string | null = 'In Progress';
    if (winner) {
        outcome = winner;
    } else if (history.length === 10) {  // All squares filled without a winner
        outcome = 'Draw';
    }

    // Construct the game state object
    const gameState = {
        history: history,
        outcome: outcome
    };

    // Convert the game state object to a JSON string
    // const gameStateJSON = JSON.stringify(gameState);

    // Save the game state (e.g., send to a server, save to local storage, etc.)
    console.log(gameState);  // For demonstration purposes
    return gameState;
  }

  function handleRestartGame() {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
  }

  function handleSubmitGame() {
    // Handle the game submission logic here.
    // For example, send the game result to a server.
    console.log("Game submitted with result:", winner || "Draw");
    let result = saveGameState();
    console.log(saveGameState);

    let parseData: any = [];

    for (var i = 0; i < result.history.length; i++) {
      var el = result.history[i];
      for (var j = 0; j < el.length; j++) {
        if (el[j] === "X") {
          parseData.push(1, 0, 0);
        } else if (el[j] === "O") {
          parseData.push(0, 1, 0);
        } else {
          parseData.push(0, 0, 1);
        }
      }
    }

    for (var i = 0; i < 10 - result.history.length; i++) {
      let dataToPush = [
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
      ];
      parseData.push(...dataToPush);
    }

    if (winner === "X") {
      let dataToPush = [
        1, 0 ,0,
        0, 0 ,1,
        0, 0 ,1,
        0, 0 ,1,
        0, 0 ,1,
        0, 0 ,1,
        0, 0 ,1,
        0, 0 ,1,
        0, 0 ,1,
      ];
      parseData.push(...dataToPush);
    }
    else if (winner === "O") {
      let dataToPush = [
        0, 1 ,0,
        0, 0 ,1,
        0, 0 ,1,
        0, 0 ,1,
        0, 0 ,1,
        0, 0 ,1,
        0, 0 ,1,
        0, 0 ,1,
        0, 0 ,1,
      ];
      parseData.push(...dataToPush);
    } else {
      let dataToPush = [
        0, 0 ,1,
        0, 0 ,1,
        0, 0 ,1,
        0, 0 ,1,
        0, 0 ,1,
        0, 0 ,1,
        0, 0 ,1,
        0, 0 ,1,
        0, 0 ,1,
      ];
      parseData.push(...dataToPush);
    }

    // console.log(parseData);

    // const lastHistory = result.history[result.history.length - 1];
    // const mappedData = lastHistory.map((val: any) => {
    //     if (val === "X") return 0.0;
    //     if (val === "O") return 1.0;
    //     return 2.0;
    // });

    let jsonToSubmit = {
        input_data: [parseData]
    };

    console.log(jsonToSubmit);

    const jsonBlob = new Blob([JSON.stringify(jsonToSubmit)], {type: 'application/json'});


    // Convert Blob to File
    const jsonFile = new File([jsonBlob], "data.json", {type: 'application/json'});

    let form = new FormData();

    // Stringify the operations and map
    form.append("operations", JSON.stringify({
      query: `
        mutation($id: String!, $input: Upload!) {
          initiateProof(id: $id, input: $input) {
            id
            status
          }
        }`,
      variables: {
        id: "cca7f9e4-a039-4cf1-9181-a9c5c34b5970",
        input: null
      }
    }));

    form.append("map", JSON.stringify({
      "input": ["variables.input"]
    }));

    form.append("input", jsonFile);

    const options = {
      method: 'POST',
      body: form
    };

    options.body = form;



    fetch('https://hub-staging.ezkl.xyz/graphql', options)
      .then(response => response.json())
      .then(response => {
        console.log(response);
        // get data
          // Ensure the response has the expected structure
        if (response.data && response.data.initiateProof && response.data.initiateProof.id) {
          const id = response.data.initiateProof.id;
          // Poll the getProof endpoint periodically with initial count 0
          pollGetProof(id, 0);
        } else {
          console.warn("Unexpected mutation response structure:", response);
        }
      })
      .catch(err => console.error(err));
  }


  const pollGetProof = (taskId: string, attemptCount: number) => {
    alert("Proving the game")
    if (attemptCount >= MAX_POLL_ATTEMPTS) {
      alert("Proof Failed");
      throw new Error("Timeout: Exceeded maximum number of polling attempts.");
    }

    const getProofOptions = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        query: `
          query($taskId: String!) {
            getProof(id: $taskId) {
              proof
              instances
              status
            }
          }`,
        variables: {
          taskId: taskId
        }
      })
    };

    fetch('https://hub-staging.ezkl.xyz/graphql', getProofOptions)
      .then(response => response.json())
      .then(response => {
        console.log(response);

        if (response.errors) {
          console.error("GraphQL Errors:", response.errors);
          return;
        } else {
          if (response.data && response.data.getProof && response.data.getProof.proof && response.data.getProof.instances) {
            write({
              args: [response.data.getProof.proof, response.data.getProof.instances],
            })
            return;
          }
        }

        // Check if you've received the desired result (you can modify this condition)
        if (response.data.getProof.status === "PENDING") {
          // If not received, wait for a bit (e.g., 5 seconds) and poll again
          setTimeout(() => pollGetProof(taskId, attemptCount + 1), 5000);
        }
      })
      .catch(err => console.error(err));
  }


  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });


  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="flex flex-row justify-center items-start mb-4">
        <div className="game-board" style={{ marginTop: "-8rem" }}>
          <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
        </div>
      </div>
      <div className="game-actions space-x-1">
        <button className="bg-blue-500 text-white font-bold py-2 px-2 rounded hover:bg-blue-700 transition duration-300 ease-in-out" onClick={saveGameState}>Save Game</button>
        <button className="bg-green-500 text-white font-bold py-2 px-2 rounded hover:bg-green-700 transition duration-300 ease-in-out" onClick={handleRestartGame}>Restart Game</button>
        {isGameCompleted && (
          <button className="bg-red-500 text-white font-bold py-2 px-2 rounded hover:bg-red-700 transition duration-300 ease-in-out" onClick={handleSubmitGame}>Submit Game</button>
        )}
      </div>
      {/* <div className="game-info ml-4">
        <ol>{moves}</ol>
      </div> */}
    </div>
  );
}

function calculateWinner(squares: (string | null)[]): string | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}