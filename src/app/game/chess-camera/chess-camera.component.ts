import { Component, inject } from '@angular/core';
import { PerspectiveCamera, Vector3, WebGLRenderer } from 'three';
import { CameraGameObject, GameObject, provideAsGameObject } from '../../three-js-container/three-js';
import { GameControllerService, GameState } from '../game-controller.service';

@Component({
  selector: 'app-chess-camera',
  standalone: true,
  template: '',
  providers: [
    provideAsGameObject(ChessCameraComponent)
  ]
})
export class ChessCameraComponent extends CameraGameObject implements GameObject {
  private gameController = inject(GameControllerService);

  init(renderer: WebGLRenderer, canvas: HTMLCanvasElement): void {
    this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(-22.5, 11, -23.5);
    this.object3D = this.camera;
  }
}
