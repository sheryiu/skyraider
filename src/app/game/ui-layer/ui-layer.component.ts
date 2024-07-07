import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameControllerService, GameState } from '../game-controller.service';
import { ResultLayerComponent } from './result-layer/result-layer.component';

@Component({
  selector: 'app-ui-layer',
  standalone: true,
  imports: [
    NgClass,
    ResultLayerComponent,
    RouterLink,
  ],
  templateUrl: './ui-layer.component.html'
})
export class UiLayerComponent {
  private gameController = inject(GameControllerService);
  gameState = this.gameController.state.asReadonly();

  gameStates = GameState;

  onStartGameClick() {
    this.gameController.startGame();
  }
}
