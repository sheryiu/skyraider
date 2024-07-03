import { Component, afterNextRender, inject } from '@angular/core';
import { Chess, Color, PieceSymbol, Square } from 'chess.js';
import { ModelLoaderService } from '../core/model-loader.service';
import { ThreeJsContainerComponent } from '../three-js-container/three-js-container.component';
import { ChessBoardSquareComponent } from './chess-board-square/chess-board-square.component';
import { ChessCameraComponent } from './chess-camera/chess-camera.component';
import { ChessControlsComponent } from './chess-controls/chess-controls.component';
import { ChessLightComponent } from './chess-light/chess-light.component';
import { ChessPieceComponent } from './chess-piece/chess-piece.component';
import { ChessSceneComponent } from './chess-scene/chess-scene.component';
import { GameControllerComponent } from './game-controller/game-controller.component';
import { RaycastBoxComponent } from './raycast-box/raycast-box.component';

export function fileToInt(file: string) {
  return file.charCodeAt(0) - 97;
}
export function rankToInt(rank: string) {
  return rank.charCodeAt(0) - 49;
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    ThreeJsContainerComponent,
    GameControllerComponent,
    ChessSceneComponent,
    ChessCameraComponent,
    ChessPieceComponent,
    ChessLightComponent,
    ChessControlsComponent,
    RaycastBoxComponent,
    ChessBoardSquareComponent,
  ],
  templateUrl: './game.component.html',
})
export class GameComponent {
  private loader = inject(ModelLoaderService);
  isLoading = this.loader.isLoading;

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

  constructor() {
    afterNextRender(() => {
      this.loader.loadGLTFModel('chessPieces', 'low_poly_chess_pieces/scene.gltf');
    })

  }

}
