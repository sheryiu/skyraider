import { Component } from '@angular/core';
import { PerspectiveCamera, WebGLRenderer } from 'three';
import { CameraGameObject, GameObject, provideAsGameObject } from '../../three-js-container/three-js';

@Component({
  selector: 'app-chess-camera',
  standalone: true,
  template: '',
  providers: [
    provideAsGameObject(ChessCameraComponent)
  ]
})
export class ChessCameraComponent extends CameraGameObject implements GameObject {
  init(renderer: WebGLRenderer, canvas: HTMLCanvasElement): void {
    this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(-23, 7, -23);
    this.camera.rotation.set(-2.7, -0.7, -2.86);
  }

  animate(time: number, frame: XRFrame, renderer: WebGLRenderer, canvas: HTMLCanvasElement): void {
  }
}
