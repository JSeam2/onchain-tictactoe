import json

def check_winner(board):
    winning_combinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  # rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  # columns
        [0, 4, 8], [2, 4, 6]              # diagonals
    ]
    for combo in winning_combinations:
        if board[combo[0]] == board[combo[1]] == board[combo[2]] and board[combo[0]] is not None:
            return board[combo[0]]
    return None

def generate_games(board, player):
    winner = check_winner(board)
    if winner or None not in board:
        # Game is over, save the outcome and board state
        return [{
            "history": [list(board)],
            "outcome": winner if winner else "Draw"
        }]
    
    games = []
    for i in range(9):
        if board[i] is None:
            new_board = board.copy()
            new_board[i] = player
            next_player = 'O' if player == 'X' else 'X'
            next_games = generate_games(new_board, next_player)
            for game in next_games:
                game["history"].insert(0, list(board))
            games.extend(next_games)
    
    return games

initial_board = [None for _ in range(9)]
games = generate_games(initial_board, 'X')

with open("tic_tac_toe_games.json", "w") as file:
    file.write("[\n")  # Start of the list
    for i, game in enumerate(games):
        json.dump(game, file, separators=(',', ': '))
        if i != len(games) - 1:  # If it's not the last game, add a comma
            file.write(",\n")
        else:
            file.write("\n")
    file.write("]\n")