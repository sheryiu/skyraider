import { Component, DestroyRef, ElementRef, Injector, afterNextRender, computed, contentChildren, effect, inject, input, untracked, viewChild } from '@angular/core';
import * as THREE from 'three';
import { CameraGameObject, GAME_OBJECT, GameObject, SceneGameObject } from './three-js';

@Component({
  selector: 'app-three-js-container',
  standalone: true,
  imports: [],
  templateUrl: './three-js-container.component.html',
  host: {
    class: 'overflow-hidden'
  }
})
export class ThreeJsContainerComponent {
  private gameObjects = contentChildren<GameObject>(GAME_OBJECT)
  private canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private renderer = computed<THREE.WebGLRenderer | undefined>(() => {
    const canvas = this.canvas()?.nativeElement;
    if (!canvas || !(canvas instanceof HTMLCanvasElement) || !window) return undefined;
    const renderer = new THREE.WebGLRenderer({
      canvas,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = true;
    return renderer;
  });
  private injector = inject(Injector);
  private destroyRef = inject(DestroyRef);

  currentScene = input<SceneGameObject>()
  currentCamera = input<CameraGameObject>()

  constructor() {
    afterNextRender(() => {
      effect(() => {
        const renderer = this.renderer();
        const canvas = this.canvas()?.nativeElement;
        if (!renderer || !canvas) return;
        console.log(this.gameObjects())
        this.gameObjects().forEach(gameObject => {
          if (gameObject.initialized) return;
          gameObject.init?.(renderer, canvas);
          gameObject.initialized = true;
        })
      }, { injector: this.injector, allowSignalWrites: true });

      const setAnimationLoopRef = effect(() => {
        const renderer = this.renderer();
        const canvas = this.canvas()?.nativeElement;
        if (!renderer || !canvas) return;
        renderer.setAnimationLoop((time, frame) => {
          untracked(() => this.gameObjects()).forEach(gameObject => {
            if (!gameObject.initialized) return;
            gameObject.animate?.(time, frame, renderer, canvas);
          })
          const sceneGO = untracked(() => this.currentScene())
          const cameraGO = untracked(() => this.currentCamera())
          if (sceneGO?.scene && cameraGO?.camera) {
            renderer.render(sceneGO.scene, cameraGO.camera)
          }
        });
        setAnimationLoopRef.destroy();
      }, { manualCleanup: true, injector: this.injector });
      this.destroyRef.onDestroy(() => setAnimationLoopRef.destroy());
    })
  }
}
