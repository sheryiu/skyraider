import { Component, computed, effect, inject, input } from '@angular/core';
import { Color, PieceSymbol, Square } from 'chess.js';
import { Mesh, Object3D, Object3DEventMap, Vector3, WebGLRenderer } from 'three';
import { ModelLoaderService } from '../../core/model-loader.service';
import { GameObject, provideAsGameObject } from '../../three-js-container/three-js';
import { GameControllerService } from '../game-controller.service';
import { fileToInt, rankToInt } from '../game.component';

enum State {
  INITIAL,
  SELECTED,
}

/**
 * ['Chess_Bishop_Black_0', 'Chess_King_Black_1', 'Chess_Knight_Black_2', 'Chess_Pawn_Black_3', 'Chess_Queen_Black_4', 'Chess_Rook_Black_5', 'Chess_Bishop_White_6', 'Chess_King_White_7', 'Chess_Knight_White_8', 'Chess_Pawn_White_9', 'Chess_Queen_White_10', 'Chess_Rook_White_11']
 */

@Component({
  selector: 'app-chess-piece',
  standalone: true,
  imports: [],
  template: ``,
  providers: [
    provideAsGameObject(ChessPieceComponent),
  ]
})
export class ChessPieceComponent implements GameObject {
  initialized: boolean = false;
  object3D?: Object3D<Object3DEventMap> | undefined;
  color = input.required<Color>();
  piece = input.required<PieceSymbol>();
  square = input.required<Square>();
  private modelName = computed(() => {
    switch (this.color()) {
      case 'w': {
        switch (this.piece()) {
          case 'p': return 'Chess_Pawn_White_9'
          case 'n': return 'Chess_Knight_White_8'
          case 'b': return 'Chess_Bishop_White_6'
          case 'r': return 'Chess_Rook_White_11'
          case 'q': return 'Chess_Queen_White_10'
          case 'k': return 'Chess_King_White_7'
        }
        break;
      }
      case 'b':{
        switch (this.piece()) {
          case 'p': return 'Chess_Pawn_Black_3'
          case 'n': return 'Chess_Knight_Black_2'
          case 'b': return 'Chess_Bishop_Black_0'
          case 'r': return 'Chess_Rook_Black_5'
          case 'q': return 'Chess_Queen_Black_4'
          case 'k': return 'Chess_King_Black_1'
        }
        break;
      }
    }
  })
  private file = computed(() => this.square().at(0)!)
  private rank = computed(() => this.square().at(1)!)
  private loader = inject(ModelLoaderService);
  private gameController = inject(GameControllerService);
  private state: State = State.INITIAL;
  private targetPosition = new Vector3();
  private stateChangedAt: DOMHighResTimeStamp = 0;

  constructor() {
    effect(() => {
      const file = this.file();
      const rank = this.rank();
      if (!this.initialized) return;
      this.targetPosition.set(fileToInt(file) * 4 - 16 + 2, 0, rankToInt(rank) * 4 - 16 + 2)
    })
  }

  init(renderer: WebGLRenderer, canvas: HTMLCanvasElement): void {
    this.object3D = this.loader.getModel('chessPieces')()?.scene.getObjectByName(this.modelName())?.clone(true)!;
    if (this.color() == 'b') {
      this.object3D.rotateY(Math.PI / 2)
    } else {
      this.object3D.rotateY(-Math.PI / 2)
    }
    this.object3D.traverse(node => {
      if (node instanceof Mesh) {
        node.castShadow = true;
      }
    })
    this.targetPosition.set(fileToInt(this.file()) * 4 - 16 + 2, 0, rankToInt(this.rank()) * 4 - 16 + 2)
    this.object3D.position.copy(this.targetPosition)
  }

  onPointerdown(event: PointerEvent) {
    this.gameController.selectSquare(this.square());
    return true;
  }

  animate(time: DOMHighResTimeStamp, frame: XRFrame, renderer: WebGLRenderer, canvas: HTMLCanvasElement): void {
    const newState = this.newState();
    if (this.state != newState) {
      this.stateChangedAt = time;
      this.state = newState;
      switch (this.state) {
        case State.INITIAL:
          this.targetPosition.y = 0;
          break;
        case State.SELECTED:
          this.targetPosition.y = 1;
          break;
      }
    }
    if (!this.targetPosition.equals(this.object3D!.position)) {
      const animationMs = 500; // this should be changed depending on which animation is playing
      this.object3D!.position.lerp(this.targetPosition, Math.min(1, (time - this.stateChangedAt) / animationMs))
      const diff = this.targetPosition.clone().sub(this.object3D!.position);
      if (Math.abs(diff.x) < 0.0001) this.object3D?.position.setX(this.targetPosition.x);
      if (Math.abs(diff.y) < 0.0001) this.object3D?.position.setY(this.targetPosition.y);
      if (Math.abs(diff.z) < 0.0001) this.object3D?.position.setZ(this.targetPosition.z);
    }
  }

  private newState() {
    if (this.gameController.selectedSquare == this.square()) {
      return State.SELECTED;
    } else {
      return State.INITIAL;
    }
  }
}