import { Component, input } from '@angular/core';
import { DirectionalLight, DirectionalLightHelper, Object3D, Object3DEventMap, WebGLRenderer } from 'three';
import { GameObject, provideAsGameObject } from '../../three-js-container/three-js';

@Component({
  selector: 'app-chess-light-helper',
  standalone: true,
  imports: [],
  template: ``,
  providers: [
    provideAsGameObject(ChessLightHelperComponent),
  ]
})
export class ChessLightHelperComponent implements GameObject {
  initialized: boolean = false;
  object3D?: Object3D<Object3DEventMap> | undefined;
  light = input<GameObject>();

  init(renderer: WebGLRenderer, canvas: HTMLCanvasElement): void {
    if (this.light()?.object3D instanceof DirectionalLight) {
      this.object3D = new DirectionalLightHelper(this.light()!.object3D as DirectionalLight)
    }
  }
}
