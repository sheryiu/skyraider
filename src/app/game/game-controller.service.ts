import { effect, Injectable, signal } from '@angular/core';
import { Chess, Color, DEFAULT_POSITION, Move, PieceSymbol, ROOK, Square, SQUARES, WHITE } from 'chess.js';
import { Subject } from 'rxjs';

function addRank(square: Square, rankDiff: number): Square {
  const [file, rank] = square.split('');
  return `${ file }${ Number(rank) + rankDiff }` as Square
}

export enum GameState {
  Initial,
  Game,
  Result,
}

const NOT_YET_START_SETUP = '4k3/8/8/8/8/8/8/4K3 w - - 0 1'
const CASTLING_TEST_SETUP = 'rnbqkbnr/8/8/pppp1ppp/1P1PpPP1/B1NQ1N1B/P1P1P2P/R3K2R w KQkq - 0 10'
const CHECKMATE_TEST_SETUP = '2R1k3/8/5P2/4N3/8/8/8/4K3 b - - 0 1'

@Injectable()
export class GameControllerService {

  private chess = new Chess(NOT_YET_START_SETUP);
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
  colorToMove = signal<Color>(WHITE)
  isInCheck = signal<boolean>(false);
  result = signal<{
    isCheckmate: boolean;
    isDraw: boolean;
    isInsufficientMaterial: boolean;
    isStalemate: boolean;
    isThreefoldRepetition: boolean;
  }>({
    isCheckmate: false,
    isDraw: false,
    isInsufficientMaterial: false,
    isStalemate: false,
    isThreefoldRepetition: false,
  })

  state = signal(GameState.Initial, { equal: () => false });

  onMove = new Subject<Move>();

  constructor() {
    effect(() => {
      switch (this.state()) {
        case GameState.Initial: {
          this.chess.load(NOT_YET_START_SETUP)
          this.isInteractable = false;
          this.initializePiecesLocation();
          break;
        }
        case GameState.Game: {
          this.colorToMove.set(this.chess.turn());
          this.isInCheck.set(this.chess.inCheck());
          if (this.chess.isGameOver()) {
            this.endGame();
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
  }

  startGame(fen?: string) {
    if (this.state() != GameState.Initial) throw new Error('Invalid State');
    this.chess.load(fen ?? DEFAULT_POSITION)
    this.initializePiecesLocation();
    this.result.set({
      isCheckmate: this.chess.isCheckmate(),
      isDraw: this.chess.isDraw(),
      isInsufficientMaterial: this.chess.isInsufficientMaterial(),
      isStalemate: this.chess.isStalemate(),
      isThreefoldRepetition: this.chess.isThreefoldRepetition(),
    })
    this.state.set(GameState.Game);
  }

  getFen() {
    return this.chess.fen();
  }

  move(options: { from?: Square, to?: Square, san?: string }) {
    if (this.state() != GameState.Game) throw new Error('Invalid State');
    const move = (options.from && options.to)
      ? this.chess.move({ from: options.from, to: options.to })
      : options.san
      ? this.chess.move(options.san)
      : this.chess.move('');
    this.updatePiecesLocation(move);
    this.onMove.next(move);
    this.selectedSquare = null;
    this.validMovesToSquare = [];
    this.state.set(GameState.Game);
  }

  endGame() {
    if (this.state() != GameState.Game) throw new Error('Invalid State');
    this.result.set({
      isCheckmate: this.chess.isCheckmate(),
      isDraw: this.chess.isDraw(),
      isInsufficientMaterial: this.chess.isInsufficientMaterial(),
      isStalemate: this.chess.isStalemate(),
      isThreefoldRepetition: this.chess.isThreefoldRepetition(),
    })
    this.state.set(GameState.Result);
  }

  restart() {
    this.state.set(GameState.Initial);
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