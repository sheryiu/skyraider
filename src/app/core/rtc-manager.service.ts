import { Injectable } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RtcManagerService {

  private pc?: RTCPeerConnection;
  private dataChannel?: RTCDataChannel;
  private iceCandidates?: Promise<RTCIceCandidate[]>;

  onChannelOpen = new ReplaySubject<boolean | null>(1);
  onChannelDataReceive = new Subject<string>();

  initialize(withOffer?: RTCSessionDescriptionInit) {
    this.onChannelOpen.next(null)
    const configuration: RTCConfiguration = {
      iceServers: [
        {
          urls: 'stun:stun1.l.google.com:19302'
        }
      ]
    }
    this.pc = new RTCPeerConnection(configuration)
    this.iceCandidates = new Promise<RTCIceCandidate[]>(resolve => {
      const iceCandidates = [] as RTCIceCandidate[];
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(iceCandidates)
        }
      }, 10_000)
      this.pc!.onicecandidate = ({ candidate }) => {
        console.log('ICE Candidate', candidate)
        if (candidate) iceCandidates.push(candidate);
        else {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout)
            resolve(iceCandidates)
          }
        }
      }
    });
    if (withOffer) {
      this.pc.setRemoteDescription(withOffer);
      this.pc.ondatachannel = (event) => {
        this.dataChannel = event.channel;
        this.setUpDataChannel();
      }
      return Promise.all([
        this.iceCandidates,
        this.pc.createAnswer().then(desc => {
          this.pc?.setLocalDescription(desc);
          return desc;
        })
      ])
    } else {
      this.dataChannel = this.pc.createDataChannel('chess');
      this.setUpDataChannel();
      return Promise.all([
        this.iceCandidates,
        this.pc.createOffer().then(desc => {
          this.pc?.setLocalDescription(desc);
          return desc;
        })
      ])
    }
  }

  private setUpDataChannel() {
    if (this.dataChannel == null) throw new Error('Not Yet Initialized');
    this.dataChannel.onopen = event => {
      console.log('open')
      this.onChannelOpen.next(true);
    }
    this.dataChannel.onclose = event => {
      console.log('close')
      this.onChannelOpen.next(null);
    }
    this.dataChannel.onerror = event => {
      console.log('error', event)
      this.onChannelOpen.next(null);
    }
    this.dataChannel.onmessage = event => {
      this.onChannelDataReceive.next(event.data);
    }
  }

  addIceCandidates(iceCandidates: RTCIceCandidate[]) {
    if (this.pc == null) throw new Error('Not Yet Initialized');
    iceCandidates.forEach(candidate => {
      this.pc!.addIceCandidate(candidate);
    })
  }

  setAnswer(answer: RTCSessionDescriptionInit) {
    if (this.pc == null) throw new Error('Not Yet Initialized');
    this.pc.setRemoteDescription(answer)
  }

  sendData(data: string) {
    if (this.dataChannel == null) throw new Error('Not Yet Initialized');
    if (this.dataChannel.readyState != 'open') throw new Error(`DataChannel not open, current state is ${ this.dataChannel.readyState }`);
    this.dataChannel.send(data);
  }

  static formatAsUrl(data: [RTCIceCandidate[], RTCSessionDescriptionInit]) {
    return encodeURIComponent(btoa(JSON.stringify(data)))
  }

  static parseFromUrl(data: string): [RTCIceCandidate[], RTCSessionDescriptionInit] {
    return JSON.parse(atob(decodeURIComponent(data)))
  }
}
