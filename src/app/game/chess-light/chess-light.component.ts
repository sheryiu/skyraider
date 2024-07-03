import { Component } from '@angular/core';
import { CameraHelper, DirectionalLight, Object3D, Object3DEventMap, Vector2, Vector3, WebGLRenderer } from 'three';
import { GameObject, provideAsGameObject } from '../../three-js-container/three-js';

@Component({
  selector: 'app-chess-light',
  standalone: true,
  template: ``,
  providers: [
    provideAsGameObject(ChessLightComponent),
  ]
})
export class ChessLightComponent implements GameObject {
  initialized: boolean = false;
  object3D?: DirectionalLight;
  init(renderer: WebGLRenderer, canvas: HTMLCanvasElement): void {
    this.object3D = new DirectionalLight(0xffffff, 2)
    this.object3D.position.set(0, 40, 0)
    this.object3D.castShadow = true;
  }
}
