import { Component } from '@angular/core';
import { GameObject, provideAsGameObject } from '../../three-js-container/three-js';

@Component({
  selector: 'app-game-controller',
  standalone: true,
  template: '',
  providers: [
    provideAsGameObject(GameControllerComponent)
  ]
})
export class GameControllerComponent implements GameObject {
  initialized: boolean = false;
}
