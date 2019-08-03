import React from 'react';
import Upload from './Upload';
import Record from './Record';
import Recordings from './Recordings';
import Stream from './Stream';
import ModelSettings from './ModelSettings';
import StreamSettings from './StreamSettings';
import uuidv1 from 'uuid/v1';

export default class Dashboard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            recordings: [],
            transcripts: [],
            streamSettings: {
                aggressiveness: 3
            }
        }
    }

    addRecording = (recording) => {
        this.setState({
            recordings: [
                ...this.state.recordings,
                { 
                    id: uuidv1(),
                    recording: recording
                }
            ]
        })
    }

    addTranscript = (transcript) => {
        this.setState({
            transcripts: [
                ...this.state.transcripts,
                transcript
            ]
        })
    }

    submitStreamSettings = (settings) => {
        this.setState({ streamSettings: settings })
    }

    removeRecording = (id) => {
        this.setState({
            recordings: this.state.recordings.filter((item) => {
                return item.id != id;
            })
        })
    }

/*     componentDidMount = () => {
        createSocket('transcribe').then((socket) => {
            socket.onMessage((event) => {

            });
            this.transcribeSocket = socket;
        }).catch((e) => {
            console.log(e);
        })
    } */

    render() {
        return (
            <div className="dashboard">
                <div className="main">
                    <ModelSettings />
                    <StreamSettings 
                        submit={(e) => this.submitStreamSettings(e)}
                    />
                </div>
                <div className="main">
                    <Stream 
                        settings={this.state.streamSettings}    
                    />
                    <Upload 
                        add={(e) => this.addRecording(e)}
                    />
                    <Record 
                        add={(e) => this.addRecording(e)}
                    />
                    <Recordings 
                        recordings={this.state.recordings}
                        addTranscript={(e) => this.addTranscript(e)}
                        remove={(e) => this.removeRecording(e)}
                    />
                </div>
            </div>
        )
    }
}

{/*  */}