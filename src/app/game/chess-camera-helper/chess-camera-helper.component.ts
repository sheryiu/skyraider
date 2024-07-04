import { Component, input } from '@angular/core';
import { Camera, CameraHelper, Light, Object3D, Object3DEventMap, WebGLRenderer } from 'three';
import { GameObject, provideAsGameObject } from '../../three-js-container/three-js';

@Component({
  selector: 'app-chess-camera-helper',
  standalone: true,
  imports: [],
  template: ``,
  providers: [
    provideAsGameObject(ChessCameraHelperComponent),
  ]
})
export class ChessCameraHelperComponent implements GameObject {
  initialized: boolean = false;
  object3D?: Object3D<Object3DEventMap> | undefined;
  camera = input<GameObject>();
  init(renderer: WebGLRenderer, canvas: HTMLCanvasElement): void {
    if (this.camera()?.object3D instanceof Light) {
      this.object3D = new CameraHelper((this.camera()?.object3D as Light).shadow?.camera!);
    }
  }
}
