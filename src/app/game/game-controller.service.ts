import { Injectable } from '@angular/core';
import { Chess, Color, PieceSymbol, Square } from 'chess.js';

@Injectable()
export class GameControllerService {

  private chess = new Chess();
  pieces = this.chess.board().flat().filter((square): square is {
    square: Square;
    type: PieceSymbol;
    color: Color;
  } => square != null)
  board = Array(8).fill(97).map((_file: number, i) => {
    const file = String.fromCharCode(_file + i)
    return Array(8).fill(49).map((_rank: number, i) => {
      const rank = String.fromCharCode(_rank + i)
      return (file + rank) as Square;
    }).map(square => ({
      square,
      color: this.chess.squareColor(square)
    }))
  })

  selectedSquare: Square | null = null;
  selectPiece(square: Square) {
    this.selectedSquare = square;
  }
}
