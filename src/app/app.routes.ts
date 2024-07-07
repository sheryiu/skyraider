import { Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { HostGameComponent } from './host-game/host-game.component';
import { JoinGameComponent } from './join-game/join-game.component';

export const routes: Routes = [
  {
    path: '',
    component: GameComponent,
    children: [
      {
        path: 'host-game',
        component: HostGameComponent,
      },
      {
        path: 'join-game',
        component: JoinGameComponent,
      }
    ]
  },
];
