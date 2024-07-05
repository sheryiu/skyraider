import { Injectable, signal } from '@angular/core';
import { Chess, Color, Move, PieceSymbol, Square, SQUARES } from 'chess.js';

@Injectable()
export class GameControllerService {

  private chess = new Chess();
  pieces = signal([] as Array<{
    square: Square;
    type: PieceSymbol;
    color: Color;
  }>);
  board = SQUARES.map(square => ({
    square,
    color: this.chess.squareColor(square),
  }))
  selectedSquare: Square | null = null;
  validMovesToSquare: Square[] = [];

  constructor() {
    this.pieces.set(
      this.chess.board()
        .flat()
        .filter((square): square is {
          square: Square;
          type: PieceSymbol;
          color: Color;
        } => square != null)
    )
  }

  private updatePiecesLocation(move: Move) {
    this.pieces.update(pieces => {
      return pieces
        .filter(p => {
          if (move.captured == p.type && move.to == p.square) return false;
          return true
        })
        .map(p => {
          if (p.square == move.from) return {
            ...p,
            square: move.to,
          }
          return p;
        })
    })
  }

  selectSquare(square: Square) {
    if (this.validMovesToSquare.includes(square) && this.selectedSquare) {
      const move = this.chess.move({ from: this.selectedSquare, to: square })
      this.updatePiecesLocation(move);
      this.selectedSquare = null;
      this.validMovesToSquare = [];
    } else {
      this.selectedSquare = square;
      this.validMovesToSquare = this.chess.moves({ square, verbose: true }).map(move => move.to);
    }
  }
}
