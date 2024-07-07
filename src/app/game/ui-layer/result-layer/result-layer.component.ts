import { Component, inject } from '@angular/core';
import { GameControllerService } from '../../game-controller.service';

@Component({
  selector: 'app-result-layer',
  standalone: true,
  imports: [],
  templateUrl: `./result-layer.component.html`
})
export class ResultLayerComponent {
  private gameController = inject(GameControllerService);
  result = this.gameController.result.asReadonly();
  colorToMove = this.gameController.colorToMove.asReadonly();

  onRestartClick() {
    this.gameController.restart();
  }
}
