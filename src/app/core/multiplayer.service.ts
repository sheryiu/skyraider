import { Injectable, inject } from '@angular/core';
import { GameControllerService } from '../game/game-controller.service';
import { RtcManagerService } from './rtc-manager.service';

const START_PREFIX = '✔ ';
const MOVE_PREFIX = '♟️ ';

@Injectable()
export class MultiplayerService {
  private gameController = inject(GameControllerService);
  private rtcManager = inject(RtcManagerService);

  isHost = false;

  startGameAsHost() {
    this.isHost = true;
    this.gameController.startGame({ isWhiteMovable: true, isBlackMovable: false });
    this.rtcManager.sendData(`${ START_PREFIX }${ this.gameController.getFen() }`)
    this.rtcManager.onChannelDataReceive.subscribe((data) => {
      if (data.startsWith(START_PREFIX)) {
      } else if (data.startsWith(MOVE_PREFIX)) {
        this.gameController.move({ san: data.substring(MOVE_PREFIX.length) })
      }
    })
    this.gameController.onMove.subscribe((move) => {
      if ((move.color == 'b' && this.gameController.isBlackMovable()) || (move.color == 'w' && this.gameController.isWhiteMovable())) {
        this.rtcManager.sendData(`${ MOVE_PREFIX }${ move.san }`)
      }
    })
  }

  startGameAsParticipant() {
    this.isHost = false;
    this.rtcManager.onChannelDataReceive.subscribe((data) => {
      if (data.startsWith(START_PREFIX)) {
        this.gameController.startGame({
          isWhiteMovable: false,
          isBlackMovable: true,
          fen: data.substring(START_PREFIX.length)
        })
      } else if (data.startsWith(MOVE_PREFIX)) {
        this.gameController.move({ san: data.substring(MOVE_PREFIX.length) })
      }
    })
    this.gameController.onMove.subscribe((move) => {
      if ((move.color == 'b' && this.gameController.isBlackMovable()) || (move.color == 'w' && this.gameController.isWhiteMovable())) {
        this.rtcManager.sendData(`${ MOVE_PREFIX }${ move.san }`)
      }
    })
  }
}
