import { Component, inject, input } from '@angular/core';
import { Vector3, WebGLRenderer } from 'three';
// import { MapControls } from 'three/addons/controls/MapControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CameraGameObject, GameObject, provideAsGameObject } from '../../three-js-container/three-js';
import { GameControllerService, GameState } from '../game-controller.service';

@Component({
  selector: 'app-chess-controls',
  standalone: true,
  imports: [],
  template: ``,
  providers: [
    provideAsGameObject(ChessControlsComponent)
  ]
})
export class ChessControlsComponent implements GameObject {
  initialized: boolean = false;
  currentCamera = input.required<CameraGameObject>();
  controls?: OrbitControls;
  private gameController = inject(GameControllerService);

  init(renderer: WebGLRenderer, canvas: HTMLCanvasElement): void {
    this.controls = new OrbitControls(this.currentCamera().camera!, canvas);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
    this.controls.enablePan = false;
    this.controls.enableDamping = false;
    this.controls.minPolarAngle = Math.PI * 0.1;
    this.controls.maxPolarAngle = Math.PI * 0.4;
  }

  animate(time: DOMHighResTimeStamp, frame: XRFrame, renderer: WebGLRenderer, canvas: HTMLCanvasElement): void {
    if (this.gameController.state() == GameState.Initial) {
      this.controls!.enableRotate = false;
      this.controls!.enableZoom = false;
      this.controls!.autoRotate = true;
      this.controls?.update()
    } else {
      this.controls!.enableRotate = true;
      this.controls!.enableZoom = true;
      this.controls!.autoRotate = false;
    }
  }
}
