import React from 'react';
import { createSocket } from '../functions/websockets';

export default class Stream extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            streaming: false,
            open: true,
            tmp: '',
            transcripts: [],
            button: 'Byrja'
        }
        this.stream = null;
        this.socket = null;
        this.streamAudioContext = null;
    }
    handleClick = () => {
        !this.state.streaming ? (
            this.startStream().then(() => {
                this.setState({ button: 'Enda' })
            }).catch((e) => {
                console.log('Error connecting to websocket: ', e);
            })
        ) : [
            this.stopStream(),
            this.setState({ button: 'Byrja' })
        ]
    }
    startStream = async () => {
        return new Promise((resolve, reject) => {
            this.setState({ streaming: true });
            createSocket('stream').then(async (socket) => {
                this.socket = socket;
                this.socket.onmessage = (event) => {
                    if (event.data) {
                        let data = JSON.parse(event.data);
                        let transcripts = this.state.transcripts;
                        if (data.type == 'intermediate') {
                            this.setState({
                                tmp: data.transcript + ''
                            })
                        } else {
                            transcripts.push(data.transcript + ' ')
                            this.setState({ 
                                transcripts: transcripts,
                                tmp: ''
                            })
                        }
                    }
                }
                this.streamAudioContext = new AudioContext({sampleRate: 16000});
                let sampleRate = this.streamAudioContext.sampleRate;
                let streamSettings = {
                    ...this.props.settings,
                    sample_rate: sampleRate
                }
                this.socket.send(JSON.stringify(streamSettings));
                this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                console.log("Streaming started.");
                this.streaming();
                resolve();
            }).catch((e) => {
                this.setState({ streaming: false });
                reject(e);
            });
        })
    }

    streaming = () => {
        let inputSrc = this.streamAudioContext.createMediaStreamSource(this.stream);
        let streamProcessor = this.streamAudioContext.createScriptProcessor(16384, 1, 1);
        inputSrc.connect(streamProcessor);
        streamProcessor.connect(this.streamAudioContext.destination);
        streamProcessor.onaudioprocess = (e) => {
            if (!e.inputBuffer.getChannelData(0).every((elem) => {return elem === 0; })) {
                    var buffer = new ArrayBuffer(e.inputBuffer.length * 2);
                    var view = new DataView(buffer);
                    this.floatTo16BitPCM(view, 0, e.inputBuffer.getChannelData(0));
                    this.socket.send(buffer);
            }
        }
    }

    floatTo16BitPCM = (output, offset, input) => {
        for (let i = 0; i < input.length; i++, offset += 2) {
            let s = Math.max(-1, Math.min(1, input[i]));
            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
    }

    clearResults = () => {
        this.setState({ 
            transcripts: []
        })
    }

    stopStream = () => {
        this.setState({ streaming: false });
        this.stream.getTracks().forEach((track) => {track.stop()});
        this.streamAudioContext.close().catch((e) => { console.log(e); });
        this.socket.close();
        console.log('Streaming stopped.');
    }

    componentDidUpdate = () => {

    }

    render() {
        return (
            <div className="streaming">
                <div className="streaming-header">
                    <h2>
                        Streymdu hljóði
                    </h2>
                </div>
                <div className="streaming-btns">
                    <button className="start-btn" onClick={this.handleClick}>{this.state.button}</button>
                    <button className="end-btn" onClick={this.clearResults} disabled={!this.state.transcripts[0]}>Hreinsa</button>
                </div>
                <div className="streaming-result">
                    {
                        this.state.transcripts.map((transcript, i) => {
                            return <span className="stream-transcript" key={i}>{transcript}</span>
                        })
                    }
                    <span className="stream-transcript">{this.state.tmp}</span>
                </div>
            </div>
        )
    }
}