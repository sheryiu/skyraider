import { Component, computed, inject, input } from '@angular/core';
import { Chess, Color, PieceSymbol, Square } from 'chess.js';
import { Object3D, Object3DEventMap, WebGLRenderer } from 'three';
import { ModelLoaderService } from '../../core/model-loader.service';
import { GameObject, provideAsGameObject, sizeOfObject } from '../../three-js-container/three-js';
import { fileToInt, rankToInt } from '../game.component';

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

  init(renderer: WebGLRenderer, canvas: HTMLCanvasElement): void {
    this.object3D = this.loader.getModel('chessPieces')()?.scene.getObjectByName(this.modelName())?.clone(true)!;
    if (this.color() == 'b') {
      this.object3D.rotateY(Math.PI / 2)
    } else {
      this.object3D.rotateY(-Math.PI / 2)
    }
    this.object3D.traverse(child => {
      child.castShadow = true;
    })
    this.object3D.castShadow = true;
    console.log(this.object3D)
    // console.log(sizeOfObject(this.object3D))
    this.object3D.position.set(fileToInt(this.file()) * 4 - 16 + 2, 0, rankToInt(this.rank()) * 4 - 16 + 2)
  }
}