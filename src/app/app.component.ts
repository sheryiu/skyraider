import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameComponent } from './game/game.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    GameComponent,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'skyraider';
}
