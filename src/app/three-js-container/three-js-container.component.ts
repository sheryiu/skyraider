import { Component, DestroyRef, ElementRef, Injector, NgZone, afterNextRender, computed, contentChildren, effect, inject, input, untracked, viewChild } from '@angular/core';
import { PCFSoftShadowMap, Raycaster, Vector2, WebGLRenderer } from 'three';
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
  private gameObjectsNested = contentChildren<GameObject>(GAME_OBJECT, { descendants: true })
  private canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private renderer = computed<WebGLRenderer | undefined>(() => {
    const canvas = this.canvas()?.nativeElement;
    if (!canvas || !(canvas instanceof HTMLCanvasElement) || !window) return undefined;
    const renderer = new WebGLRenderer({
      antialias: true,
      canvas,
    });
    // renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = true;
    return renderer;
  });
  private zone = inject(NgZone);
  private injector = inject(Injector);
  private destroyRef = inject(DestroyRef);

  currentScene = input<SceneGameObject>()
  currentCamera = input<CameraGameObject>()

  constructor() {
    const gameObjectsInScene = new Set<GameObject>();
    afterNextRender(() => {
      effect(() => {
        const renderer = this.renderer();
        const canvas = this.canvas()?.nativeElement;
        if (!renderer || !canvas) return;
        this.gameObjects().forEach(gameObject => {
          if (gameObject.initialized) return;
          gameObject.init?.(renderer, canvas);
          gameObject.initialized = true;
          gameObjectsInScene.add(gameObject)
        })
        gameObjectsInScene.forEach(gameObject => {
          if (this.gameObjects().includes(gameObject)) return;
          gameObject.onBeforeDispose?.();
          gameObjectsInScene.delete(gameObject)
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

      effect(() => {
        this.zone.runOutsideAngular(() => {
          this.canvas()?.nativeElement.addEventListener('pointerdown', (event) => {
            const sceneGO = untracked(() => this.currentScene());
            const cameraGO = untracked(() => this.currentCamera());
            const allGameObjects = untracked(() => this.gameObjectsNested()).filter(go => typeof go.onPointerdown == 'function' && go.initialized && go.object3D != null);
            if (!cameraGO?.camera || !sceneGO?.scene || allGameObjects.length <= 0) return;
            const raycaster = new Raycaster();
            raycaster.setFromCamera(new Vector2((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1), cameraGO.camera);
            const intersects = raycaster.intersectObjects(
              allGameObjects.map(go => go.object3D!),
            )
            let intersectedGameObjects = intersects.map(intersect => {
              for (const gameObject of allGameObjects) {
                let match = false;
                gameObject.object3D!.traverseVisible(child => {
                  if (child == intersect.object) match = true;
                })
                if (match) return gameObject;
              }
              return undefined;
            }).filter((go): go is GameObject => go != null)
            intersectedGameObjects = [...new Set(intersectedGameObjects)];
            for (const gameObject of intersectedGameObjects) {
              const result = gameObject.onPointerdown?.(event);
              if (result) break;
            }
          })
        })
      }, { injector: this.injector })
    })
  }
}
