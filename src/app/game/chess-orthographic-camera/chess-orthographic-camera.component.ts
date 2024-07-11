import { Component } from '@angular/core';
import { OrthographicCamera, Vector3, WebGLRenderer } from 'three';
import { CameraGameObject, GameObject, provideAsGameObject } from '../../three-js-container/three-js';

@Component({
  selector: 'app-chess-orthographic-camera',
  standalone: true,
  template: '',
  providers: [
    provideAsGameObject(ChessOrthographicCameraComponent)
  ]
})
export class ChessOrthographicCameraComponent extends CameraGameObject implements GameObject {
  init(renderer: WebGLRenderer, canvas: HTMLCanvasElement): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    let cameraWidth, cameraHeight;
    if (width > height) {
      cameraHeight = 50;
      cameraWidth = 50 * width / height;
    } else {
      cameraWidth = 50;
      cameraHeight = 50 * height / width;
    }
    this.camera = new OrthographicCamera(
      -cameraWidth / 2,
      cameraWidth / 2,
      cameraHeight / 2,
      -cameraHeight / 2,
      0.1,
      100
    );
    this.camera.position.set(0, 50, 0);
    this.camera.lookAt(new Vector3(0, 0, 0))
    this.object3D = this.camera;
  }
}
