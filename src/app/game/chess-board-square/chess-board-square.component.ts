import { Component, computed, inject, input } from '@angular/core';
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
    this.material = new MeshPhongMaterial({ color: this.color() == 'dark' ? 0x222222 : 0xDDDDDD });
    this.object3D = new Mesh(geometry, this.material);
    this.object3D.position.set(fileToInt(this.file()) * 4 - 16 + 2, -1.1, rankToInt(this.rank()) * 4 - 16 + 2)
    this.object3D.receiveShadow = true;
  }

  animate(time: DOMHighResTimeStamp, frame: XRFrame, renderer: WebGLRenderer, canvas: HTMLCanvasElement): void {
    if (this.gameController.selectedSquare == this.square()) {
      this.material!.color = new Color(0x77400d)
    } else {
      this.material!.color = new Color(this.color() == 'dark' ? 0x222222 : 0xDDDDDD)
    }
  }
}