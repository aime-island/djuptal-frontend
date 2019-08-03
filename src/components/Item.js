import React from 'react'
import LoadingComponent from './LoadingComponent';
import { createSocket } from '../functions/websockets';

export default class Item extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            transcript: '',
            transcribing: false,
            transcribed: false,
            url: URL.createObjectURL(this.props.recording.recording)
        }
        this.itemContainer = React.createRef(null);
        this.socket = null;
    }

    handleTranscribe = () => {
        this.setState({
            transcribing: true
        });
        createSocket('transcribe').then((socket) => {
            this.socket = socket;
            this.socket.onmessage = (event) => {
                this.setState({
                    transcript: event.data,
                    transcribing: false,
                    transcribed: true
                });
                let transcript = {
                    id: this.props.recording.id,
                    transcript: event.data
                }
                this.props.addTranscript(transcript)
                this.socket.close();
            }
            this.socket.send(this.props.recording.recording);
        })
    }

    handleRemove = () => {
        this.itemContainer.current.addEventListener('transitionend', () => {
            // Eyðast alltaf tvö í einu??
            // this.props.remove(this.props.recording.id);
        })
        this.itemContainer.current.style.height = 0 + 'px';
    }

    componentDidMount = () => {
        let sectionHeight = this.itemContainer.current.scrollHeight;
        this.itemContainer.current.style.height = sectionHeight + 'px';
    }

    render() {
        return (
            <div ref={this.itemContainer} className="item-container">
                <div className="item">
                    <audio controls src={this.state.url} />
                    {
                        this.state.transcribing ? 
                        (
                            <LoadingComponent/>
                        ) : !this.state.transcribed ? [
                            <button key={0} className="delete-btn" onClick={this.handleRemove}>
                                Eyða
                            </button>,
                            <button key={1} className="transcribe-btn" disabled={this.state.transcribed} onClick={this.handleTranscribe}>
                                Þýða
                            </button>
                        ] : [
                            <button key={0} className="delete-btn" onClick={this.handleRemove}>
                                Eyða
                            </button>,
                            <button key={1} className="correct-btn" onClick={this.handleTranscribe}>
                                Rétt
                            </button>
                        ]
                    }
                </div>
                <div className="transcript">
                    {this.state.transcript}
                </div>
            </div>
        )
    }
}