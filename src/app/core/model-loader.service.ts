import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

type LoadingStatus = {
  type: 'initial';
} | {
  type: 'loading';
  count: number;
} | {
  type: 'failed';
  error: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModelLoaderService {
  private loadingStatus = signal<LoadingStatus>({ type: 'initial' });
  isLoading = computed(() => {
    const status = this.loadingStatus();
    switch (status.type) {
      case 'initial': return true;
      case 'loading': return status.count > 0;
      case 'failed': return status.error;
    }
  })

  private gltfLoader?: GLTFLoader;
  private modelsMap = new Map<string, WritableSignal<GLTF | undefined>>()

  loadGLTFModel(key: string, url: string) {
    if (!this.gltfLoader) this.gltfLoader = new GLTFLoader();
    if (this.modelsMap.has(key)) throw new Error(`Key (${ key }) has been used`);
    this.modelsMap.set(key, signal(undefined));
    this.loadingStatus.update((status) => {
      switch (status.type) {
        case 'initial': return { type: 'loading', count: 1 };
        case 'loading': return { type: 'loading', count: status.count + 1 };
        case 'failed': return status;
      }
    });
    this.gltfLoader.load(
      url,
      (gltf) => {
        this.modelsMap.get(key)!.set(gltf);
        this.loadingStatus.update((status) => {
          switch (status.type) {
            case 'initial': throw new Error('Invalid Loading Status');
            case 'loading': return { type: 'loading', count: status.count - 1 };
            case 'failed': return status;
          }
        });
      },
      undefined,
      (err) => {
        console.error(err);
        this.loadingStatus.update(() => {
          return { type: 'failed', error: (err instanceof Error) ? err.message : String(err) };
        });
      }
    )
  }

  getModel<T extends GLTF>(key: string): Signal<T | undefined> {
    if (!this.modelsMap.has(key)) throw new Error(`Model (key: ${ key } has not been loaded`);
    return (this.modelsMap.get(key)! as WritableSignal<T | undefined>).asReadonly();
  }
}
