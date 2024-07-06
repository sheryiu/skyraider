import { Component, input } from '@angular/core';
import { DirectionalLight, WebGLRenderer } from 'three';
import { CameraGameObject, GameObject, provideAsGameObject } from '../../three-js-container/three-js';

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
  camera = input.required<CameraGameObject>();

  init(renderer: WebGLRenderer, canvas: HTMLCanvasElement): void {
    this.object3D = new DirectionalLight(0xffffff, 3)
    this.object3D.position.set(32, 40, 32)
    this.object3D.castShadow = true;
    this.object3D.shadow.camera.far = 1000;
    this.object3D.shadow.mapSize.set(2048, 2048)
    this.object3D.shadow.intensity = 0.7;
    const distance = 40;
    this.object3D.shadow.camera.top = distance;
    this.object3D.shadow.camera.bottom = -distance;
    this.object3D.shadow.camera.right = distance;
    this.object3D.shadow.camera.left = -distance;
  }

  animate(time: DOMHighResTimeStamp, frame: XRFrame, renderer: WebGLRenderer, canvas: HTMLCanvasElement): void {
    if (this.camera().initialized) {
      this.object3D?.position.copy(this.camera().camera!.position)
    }
  }
}
