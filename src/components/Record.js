import React from 'react';
import Recorder from 'recorderjs';
import Wave from './Wave';

export default class Record extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            button: 'Taka upp',
            rec: null,
            isRecording: false,
            duration: null
        }
    }

    handleClick = () => {
        !this.state.rec ? [
            this.setState({
                isRecording: true,
                button: 'Stoppa'
            }),
            this.startRecording()
         ] : (
            this.state.rec.recording ? [
                this.state.rec.stop(),
                this.state.rec.exportWAV(this.calcDuration),
                this.setState({
                    button: 'Halda áfram',
                    isRecording: false
                })
            ] : [
                this.state.rec.record(),
                this.setState({
                    button: 'Stoppa',
                    isRecording: true
                })
            ]
        )
    }

    calcDuration = (blob) => {
        let url = URL.createObjectURL(blob);
        let au = document.createElement('audio');
        au.addEventListener('loadedmetadata',() => {
            let dur = au.duration.toFixed(1);
            let string = dur + ' sekúndur';
            this.setState({
                duration: string
            })
        });
        au.src = url;
    } 
    startRecording = () => {
        navigator.mediaDevices.getUserMedia({ audio: true, video:false })
        .then((stream) => {
            let audioContext = new AudioContext();
            let input = audioContext.createMediaStreamSource(stream);
            let rec = new Recorder(input,{numChannels:1})
            rec.record()
            this.setState({
                rec: rec
            })
        }).catch(function(err) {
            console.log(err);
        });
    }
    
    saveRecording = () => {
        this.setState({
            button: 'Taka upp',
            rec: null,
            isRecording: false,
            duration: null
        })
        this.state.rec.exportWAV(this.props.add);
    }

    render() {
        return (
            <div className="record">
                <div className="record-header">
                    <h2>
                        Taktu upp hljóðbrot
                    </h2>
                    {
                        this.state.duration &&
                        !this.state.isRecording && (
                            <div className="duration">
                                {this.state.duration}
                            </div>
                        )
                    }
                </div>
            <div className="record-btns">
                <button className="record-btn" 
                    onClick={this.handleClick}
                >{this.state.button}</button>
                <button className="save-btn" 
                    disabled={!this.state.rec || this.state.isRecording}
                    onClick={this.saveRecording}
                >Vista</button>
            </div>
        </div>
        )
    }
}