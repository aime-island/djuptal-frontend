import React from 'react'
import { createSocket } from '../functions/websockets';

export default class ModelSettings extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            beamWidth: 1024,
            lmWeight: 1,
            wordWeight: 2,
            error: '',
            labels: {
                beamWidth: 1024,
                lmWeight: 1,
                wordWeight: 2
            }
        }

        this.form = React.createRef();
    }

    onBeamWidthChange = (e) => {
        if (!e.target.value) {
            this.setState({ beamWidth: 1024 })
        } else {
            const beamWidth = parseInt(e.target.value);
            this.setState({ beamWidth });
        }
    }

    onLmWeightChange = (e) => {
        if (!e.target.value) {
            this.setState({ lmWeight: 0.75 })
        } else {
            const lmWeight = parseFloat(e.target.value);
            this.setState({ lmWeight });
        }
    }

    onWordWeightChange = (e) => {
        if (!e.target.value) {
            this.setState({ wordWeight: 1.00 })
        } else {
            const wordWeight = parseFloat(e.target.value);
            this.setState({ wordWeight });
        }
    }

    onSubmit = (e) => {
        e.preventDefault();
        const model = {
            beam_width: this.state.beamWidth,
            lm_weight: this.state.lmWeight,
            w_weight: this.state.wordWeight
        }
        createSocket('model').then((socket) => {
            socket.send(JSON.stringify(model));
            let labels = {
                beamWidth: this.state.beamWidth,
                lmWeight: this.state.lmWeight,
                wordWeight: this.state.wordWeight
            }
            this.setState({ labels: labels })
            this.form.current.reset();
        }).catch((error) => {
            console.log(error);
        })
    }
    render() {
        return (
            <div className="settings">
                <h2>Stilltu líkanið</h2>
                <form ref={this.form} onSubmit={this.onSubmit}>
                    <div className="input-group">
                        <input
                            name="beam"
                            className="text-input"
                            type="number"
                            placeholder="beam width"
                            onChange={this.onBeamWidthChange}
                        />
                        <label>{this.state.labels.beamWidth}</label>
                    </div>
                    <div className="input-group">
                        <input 
                            className="text-input"
                            type="number"
                            step="0.01"
                            placeholder="lm weight"
                            onChange={this.onLmWeightChange}
                        />
                        <label>{this.state.labels.lmWeight}</label>
                    </div>
                    <div className="input-group">
                        <input 
                            className="text-input"
                            type="number"
                            step="0.01"
                            placeholder="word weight"
                            onChange={this.onWordWeightChange}
                        />
                        <label>{this.state.labels.wordWeight}</label>
                    </div>
                    <button className="button submit-btn">Stilla</button>
                </form>
            </div>
        )
    }
}