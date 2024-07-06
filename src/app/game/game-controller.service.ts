import { effect, Injectable, signal } from '@angular/core';
import { Chess, Color, Move, PieceSymbol, ROOK, Square, SQUARES, WHITE } from 'chess.js';

function addRank(square: Square, rankDiff: number): Square {
  const [file, rank] = square.split('');
  return `${ file }${ Number(rank) + rankDiff }` as Square
}

export enum GameState {
  Initial,
  Game,
  Result,
}

@Injectable()
export class GameControllerService {

  private chess = new Chess('4k3/8/8/8/8/8/8/4K3 w - - 0 1');
  isInteractable = false;
  pieces = signal([] as Array<{
    _id: Symbol;
    square: Square;
    type: PieceSymbol;
    color: Color;
    isSelected: boolean;
  }>);
  board = SQUARES.map(square => ({
    square,
    color: this.chess.squareColor(square),
  }))
  selectedSquare: Square | null = null;
  validMovesToSquare: Square[] = [];

  state = signal(GameState.Initial);

  // private state = {
  //   states: {
  //     [State.Initial]: {},
  //     [State.Game]: {},
  //     [State.Result]: {},
  //   },
  //   transitions: {
  //     'startGame': { from: State.Initial, to: State.Game },
  //     'move': { from: State.Game, to: State.Game },
  //     'checkmate': { from: State.Game, to: State.Result },
  //   }
  // }

  constructor() {
    effect(() => {
      switch (this.state()) {
        case GameState.Initial: {
          this.chess.load('4k3/8/8/8/8/8/8/4K3 w - - 0 1')
          this.isInteractable = false;
          this.initializePiecesLocation();
          break;
        }
        case GameState.Game: {
          if (this.chess.isCheckmate()) {
            this.checkmate();
            return;
          }
          this.isInteractable = true;
          break;
        }
        case GameState.Result: {
          this.isInteractable = false;
          break;
        }
      }
    }, { allowSignalWrites: true })
    console.log(() => this.startGame())
  }

  startGame() {
    if (this.state() != GameState.Initial) throw new Error('Invalid State');
    this.chess.load('rnbqkbnr/8/8/pppp1ppp/1P1PpPP1/B1NQ1N1B/P1P1P2P/R3K2R w KQkq - 0 10')
    this.initializePiecesLocation();
    this.state.set(GameState.Game);
  }

  move(from: Square, to: Square) {
    if (this.state() != GameState.Game) throw new Error('Invalid State');
    const move = this.chess.move({ from, to });
    this.updatePiecesLocation(move);
    this.selectedSquare = null;
    this.validMovesToSquare = [];
    this.state.set(GameState.Game);
  }

  checkmate() {
    if (this.state() != GameState.Game) throw new Error('Invalid State');
    this.state.set(GameState.Result);
  }

  private initializePiecesLocation() {
    this.pieces.set(
      this.chess.board()
        .flat()
        .filter((square): square is {
          square: Square;
          type: PieceSymbol;
          color: Color;
        } => square != null)
        .map(s => ({ ...s, _id: Symbol(), isSelected: false, }))
    )
  }
  private updatePiecesLocation(move: Move) {
    this.pieces.update(pieces => {
      return pieces
        .filter(p => {
          if (move.flags.includes('e')) {
            // en passant
            const removedPawnSquare: Square = move.color == WHITE ? addRank(move.to, -1) : addRank(move.to, 1);
            if (move.captured == p.type && move.color != p.color && removedPawnSquare == p.square) return false;
          }
          if (move.captured == p.type && move.color != p.color && move.to == p.square) return false;
          return true
        })
        .map(p => {
          if (move.flags.includes('k')) {
            // king side castling
            if (p.type == ROOK && p.color == move.color && p.square.startsWith('h')) return {
              ...p,
              square: `f${ p.square.at(1)! }` as Square
            }
          }
          if (move.flags.includes('q')) {
            // queen side castling
            if (p.type == ROOK && p.color == move.color && p.square.startsWith('a')) return {
              ...p,
              square: `d${ p.square.at(1)! }` as Square
            }
          }
          if (p.square == move.from) return {
            ...p,
            square: move.to,
          }
          return p;
        })
    })
  }

  selectSquare(square: Square) {
    this.selectedSquare = square;
    this.validMovesToSquare = this.chess.moves({ square, verbose: true }).map(move => move.to);
    this.pieces.update(pieces => {
      return pieces.map(piece => ({
        ...piece,
        isSelected: piece.square == square,
      }));
    })
  }
}
