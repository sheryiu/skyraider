import { Component, InjectionToken, Injector, Provider, Type, afterNextRender, contentChildren, effect, forwardRef, inject, signal } from '@angular/core';
import { Box3, Camera, Object3D, Object3DEventMap, Scene, Vector3, WebGLRenderer } from 'three';

export function sizeOfObject(object: Object3D) {
  const box = new Box3().setFromObject(object);
  return box.getSize(new Vector3());
}

export interface GameObject {
  initialized: boolean;
  object3D?: Object3D;
  init?(renderer: WebGLRenderer, canvas: HTMLCanvasElement): void;
  animate?(time: DOMHighResTimeStamp, frame: XRFrame, renderer: WebGLRenderer, canvas: HTMLCanvasElement): void;
  onPointerdown?(event: PointerEvent): boolean | undefined | void;
  onBeforeDispose?(): void;
}

@Component({
  selector: 'app-scene-game-object',
  template: `# This component should not be used directly`,
})
export abstract class SceneGameObject implements GameObject {
  initialized: boolean = false;
  scene?: Scene;
  private injector = inject(Injector);
  private gameObjects = contentChildren<GameObject>(GAME_OBJECT);
  private _renderer?: WebGLRenderer;
  private _canvas?: HTMLCanvasElement;
  private _scene = signal<Scene | undefined>(undefined)
  constructor() {
    const gameObjectsInScene = new Set<GameObject>();
    afterNextRender(() => {
      effect(() => {
        const scene = this._scene();
        if (!scene || !this._renderer || !this._canvas) return;
        this.gameObjects().forEach(gameObject => {
          if (gameObject.initialized) return;
          gameObject.init?.(this._renderer!, this._canvas!);
          gameObject.initialized = true;
          if (gameObject.object3D && !scene.children.includes(gameObject.object3D)) {
            scene.add(gameObject.object3D)
            gameObjectsInScene.add(gameObject)
          }
        })
        gameObjectsInScene.forEach(gameObject => {
          if (this.gameObjects().includes(gameObject)) return;
          // TODO add remove animation
          gameObject.onBeforeDispose?.();
          scene.remove(gameObject.object3D!)
          gameObjectsInScene.delete(gameObject)
        })
      }, { injector: this.injector, allowSignalWrites: true })
    })
  }
  init(renderer: WebGLRenderer, canvas: HTMLCanvasElement): void {
    this._renderer = renderer;
    this._canvas = canvas;
    this.scene = new Scene();
    this._scene.set(this.scene)
  }
  animate(time: number, frame: XRFrame, renderer: WebGLRenderer, canvas: HTMLCanvasElement): void {
    this.gameObjects().forEach(gameObject => {
      gameObject.animate?.(time, frame, renderer, canvas)
    })
  }
}

export abstract class CameraGameObject implements GameObject {
  initialized: boolean = false;
  object3D?: Object3D<Object3DEventMap> | undefined;
  camera?: Camera;
}

export const GAME_OBJECT = new InjectionToken<GameObject>('game object')
export function provideAsGameObject(cls: Type<GameObject>): Provider {
  return {
    provide: GAME_OBJECT,
    useExisting: forwardRef(() => cls),
  }
}