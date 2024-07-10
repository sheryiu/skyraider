import { Component, computed, effect, inject, input } from '@angular/core';
import { Chess, Square } from 'chess.js';
import { BoxGeometry, Color, Mesh, MeshPhongMaterial, Object3D, Object3DEventMap, WebGLRenderer } from 'three';
import { GameObject, provideAsGameObject } from '../../three-js-container/three-js';
import { GameControllerService } from '../game-controller.service';
import { fileToInt, rankToInt } from '../game.component';

@Component({
  selector: 'app-chess-board-square',
  standalone: true,
  imports: [],
  template: ``,
  providers: [
    provideAsGameObject(ChessBoardSquareComponent)
  ]
})
export class ChessBoardSquareComponent implements GameObject {
  initialized: boolean = false;
  object3D?: Object3D<Object3DEventMap> | undefined;
  color = input.required<ReturnType<Chess['squareColor']>>();
  square = input.required<Square>();
  private file = computed(() => this.square().at(0)!)
  private rank = computed(() => this.square().at(1)!)
  private material?: MeshPhongMaterial;

  private gameController = inject(GameControllerService);

  init(renderer: WebGLRenderer, canvas: HTMLCanvasElement): void {
    const geometry = new BoxGeometry(4, 1, 4);
    this.material = new MeshPhongMaterial({ color: this.color() == 'dark' ? 0x444444 : 0xDDDDDD });
    this.object3D = new Mesh(geometry, this.material);
    this.object3D.position.set(-fileToInt(this.file()) * 4 + 16 - 2, -1.1, rankToInt(this.rank()) * 4 - 16 + 2)
    this.object3D.receiveShadow = true;
  }

  onPointerdown(event: PointerEvent): boolean | undefined | void {
    if (!this.gameController.getIsCurrentColorInteractable()) return;
    if (this.gameController.validMovesToSquare.includes(this.square()) && this.gameController.selectedSquare) {
      if (this.gameController.getPieceAt(this.gameController.selectedSquare).type == 'p' && (this.square().endsWith('8') || this.square().endsWith('1'))) {
        // pawn promotion
        this.gameController.movePawnToPromotion({ from: this.gameController.selectedSquare, to: this.square() })
      } else {
        this.gameController.move({ from: this.gameController.selectedSquare, to: this.square() })
      }
    } else {
      this.gameController.selectSquare(this.square());
    }
    return true;
  }

  animate(time: DOMHighResTimeStamp, frame: XRFrame, renderer: WebGLRenderer, canvas: HTMLCanvasElement): void {
    if (this.gameController.selectedSquare == this.square()) {
      this.material!.color = new Color(0x77400d)
    } else if (this.gameController.validMovesToSquare.includes(this.square())) {
      this.material!.color = new Color(this.color() == 'dark' ? 0x388906 : 0x5b9515)
    } else {
      this.material!.color = new Color(this.color() == 'dark' ? 0x444444 : 0xDDDDDD)
    }
  }
}
