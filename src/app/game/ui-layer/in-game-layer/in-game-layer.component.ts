import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { GameControllerService } from '../../game-controller.service';

@Component({
  selector: 'app-in-game-layer',
  standalone: true,
  imports: [
    NgClass,
  ],
  templateUrl: `./in-game-layer.component.html`
})
export class InGameLayerComponent {
  private gameController = inject(GameControllerService);
  colorToMove = this.gameController.colorToMove.asReadonly();
}
