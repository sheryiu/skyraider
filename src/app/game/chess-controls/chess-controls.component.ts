import { Component, input } from '@angular/core';
import { WebGLRenderer } from 'three';
// import { MapControls } from 'three/addons/controls/MapControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CameraGameObject, GameObject, provideAsGameObject } from '../../three-js-container/three-js';

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

  init(renderer: WebGLRenderer, canvas: HTMLCanvasElement): void {
    const controls = new OrbitControls(this.currentCamera().camera!, canvas);
    controls.target.set(0, 0, 0);
    controls.update();
    controls.enablePan = false;
    controls.enableDamping = false;
  }
}
