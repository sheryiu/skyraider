import { Component, NgZone, inject, input } from '@angular/core';
import * as THREE from 'three';
import { BoxHelper, Object3D, Raycaster, Vector2, WebGLRenderer } from 'three';
import { CameraGameObject, GameObject, SceneGameObject, provideAsGameObject } from '../../three-js-container/three-js';

@Component({
  selector: 'app-raycast-box',
  standalone: true,
  imports: [],
  template: ``,
  providers: [
    provideAsGameObject(RaycastBoxComponent)
  ]
})
export class RaycastBoxComponent implements GameObject {
  initialized: boolean = false;
  object3D?: BoxHelper;
  currentScene = input.required<SceneGameObject>();
  currentCamera = input.required<CameraGameObject>();
  private lastPointedAt?: Object3D;
  private raycaster = new Raycaster();
  private mousePosition = new Vector2();
  private zone = inject(NgZone);
  init(renderer: WebGLRenderer, canvas: HTMLCanvasElement): void {
    this.object3D = new BoxHelper(new Object3D());
    this.object3D.visible = false;
    this.zone.runOutsideAngular(() => {
      canvas.addEventListener('pointermove', (event) => {
        this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
      })
    })
  }

  animate(time: number, frame: XRFrame, renderer: WebGLRenderer, canvas: HTMLCanvasElement): void {
    this.raycaster.setFromCamera(this.mousePosition, this.currentCamera().camera!);
    const intersects = this.raycaster.intersectObjects(
      this.currentScene().scene!.children.filter(c => c != this.object3D)
    );
    if (intersects.length > 0) {
      const object = intersects.at(0)!.object;
      if (object == this.lastPointedAt) return;
      this.object3D!.visible = true;
      this.lastPointedAt = object;
      this.object3D?.setFromObject(object);
      const size = new THREE.Vector3();
      // box.getSize(size);
      const worldPosition = new THREE.Vector3();
      object.getWorldPosition(worldPosition);
      // console.log(worldPosition, size)
    } else {
      this.lastPointedAt = undefined;
      this.object3D!.visible = false;
    }
  }
}
