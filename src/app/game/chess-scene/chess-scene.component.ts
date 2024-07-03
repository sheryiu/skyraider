import { Component } from '@angular/core';
import { Color, WebGLRenderer } from 'three';
import { SceneGameObject, provideAsGameObject } from '../../three-js-container/three-js';

@Component({
  selector: 'app-chess-scene',
  standalone: true,
  template: '',
  providers: [
    provideAsGameObject(ChessSceneComponent)
  ]
})
export class ChessSceneComponent extends SceneGameObject {
  override init(renderer: WebGLRenderer, canvas: HTMLCanvasElement): void {
    super.init(renderer, canvas)
    this.scene!.background = new Color(0x999999)
  }
}
