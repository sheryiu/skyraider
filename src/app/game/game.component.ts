import { Component, afterNextRender, inject, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Chess, Color, PieceSymbol, Square } from 'chess.js';
import { ModelLoaderService } from '../core/model-loader.service';
import { MultiplayerService } from '../core/multiplayer.service';
import { CameraGameObject } from '../three-js-container/three-js';
import { ThreeJsContainerComponent } from '../three-js-container/three-js-container.component';
import { ChessBoardSquareComponent } from './chess-board-square/chess-board-square.component';
import { ChessCameraHelperComponent } from './chess-camera-helper/chess-camera-helper.component';
import { ChessCameraComponent } from './chess-camera/chess-camera.component';
import { ChessControlsComponent } from './chess-controls/chess-controls.component';
import { ChessLightHelperComponent } from './chess-light-helper/chess-light-helper.component';
import { ChessLightComponent } from './chess-light/chess-light.component';
import { ChessOrthographicCameraComponent } from './chess-orthographic-camera/chess-orthographic-camera.component';
import { ChessPieceComponent } from './chess-piece/chess-piece.component';
import { ChessSceneComponent } from './chess-scene/chess-scene.component';
import { GameControllerService } from './game-controller.service';
import { RaycastBoxComponent } from './raycast-box/raycast-box.component';
import { UiLayerComponent } from './ui-layer/ui-layer.component';

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
    RouterOutlet,
    ThreeJsContainerComponent,
    ChessSceneComponent,
    ChessCameraComponent,
    ChessPieceComponent,
    ChessLightComponent,
    ChessControlsComponent,
    RaycastBoxComponent,
    ChessBoardSquareComponent,
    ChessLightHelperComponent,
    ChessCameraHelperComponent,
    UiLayerComponent,
    ChessOrthographicCameraComponent,
  ],
  providers: [GameControllerService, MultiplayerService],
  templateUrl: './game.component.html',
})
export class GameComponent {
  private loader = inject(ModelLoaderService);
  isLoading = this.loader.isLoading;

  private gameController = inject(GameControllerService);
  pieces = this.gameController.pieces;
  board = this.gameController.board;
  use2D = this.gameController.use2DCamera.asReadonly();

  camera = viewChild<CameraGameObject>('camera');

  constructor() {
    afterNextRender(() => {
      this.loader.loadGLTFModel('chessPieces', 'low_poly_chess_pieces/scene.gltf');
    })

  }

}
