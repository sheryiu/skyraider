import { afterNextRender, Component, effect, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'skyraider';

  // private pc?: RTCPeerConnection;
  // private sendChannel?: RTCDataChannel;

  // iceCandidates = signal<RTCIceCandidate[] | null>(null)
  // offer = signal<RTCSessionDescriptionInit | null>(null)

  // constructor() {
  //   afterNextRender(() => {
  //     const iceConfiguration: RTCConfiguration = {
  //       iceServers: [
  //         {
  //           urls: 'stun:stun1.l.google.com:19302'
  //         }
  //       ]
  //     }
  //     this.pc = new RTCPeerConnection(iceConfiguration)
  //     this.sendChannel = this.pc.createDataChannel('Chess')
  //     console.log((a: string) => {
  //       this.sendChannel?.send(a)
  //     })
  //     const iceCandidate = [] as RTCIceCandidate[];
  //     this.pc.onicecandidate = e => {
  //       if (e.candidate) {
  //         iceCandidate.push(e.candidate);
  //       } else {
  //         this.iceCandidates.set(iceCandidate)
  //       }
  //     }
  //     this.pc.createOffer().then((desc) => {
  //       this.offer.set(desc);
  //       this.pc?.setLocalDescription(desc)
  //     });
  //   })

  //   effect(() => {
  //     if (this.iceCandidates() && this.offer()) {
  //       console.log(`http://192.168.1.5:4200/join-game?offer=${ encodeURIComponent(JSON.stringify(this.offer())) }&candidate=${ encodeURIComponent(JSON.stringify(this.iceCandidates())) }`)
  //     }
  //   })
  // }

  // onKeydown(event: Event) {
  //   const target = event.currentTarget as HTMLInputElement;
  //   this.pc?.setRemoteDescription(JSON.parse(target.value))
  // }

  // onKeydown2(event: Event) {
  //   const target = event.currentTarget as HTMLInputElement;
  //   JSON.parse(target.value).forEach((candidate: RTCIceCandidate) => {
  //     this.pc?.addIceCandidate(candidate)
  //   })
  // }
}
