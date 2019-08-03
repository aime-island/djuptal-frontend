import React from 'react'
import { timingSafeEqual } from 'crypto';

export default class StreamSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            aggressiveness: 3,
            labels: {
                aggressiveness: 3
            }
        }

        this.form = React.createRef();
    }

    onAggressivenessChange = (e) => {
        if (!e.target.value) {
            this.setState({ aggressiveness: 3 })
        } else {
            const aggressiveness = parseInt(e.target.value);
            this.setState({ aggressiveness });
        }
    }

    onSubmit = (e) => {
        e.preventDefault();
        const settings = {
            aggressiveness: this.state.aggressiveness
        }
        let labels = {
            aggressiveness: this.state.aggressiveness
        }
        this.setState({ labels: labels })
        this.props.submit(settings);
        this.form.current.reset();
    }

    render() {
        return (
            <div className="settings">
                <h2>Stilltu streymið</h2>
                <form ref={this.form} onSubmit={this.onSubmit}>
                    <div className="input-group">
                        <input
                            name="aggressiveness"
                            className="text-input"
                            type="number"
                            placeholder="aggressiveness"
                            onChange={this.onAggressivenessChange}
                        />
                        <label>{this.state.labels.aggressiveness}</label>
                    </div>
                    <button className="button submit-btn">Stilla</button>
                </form>
            </div>
        )
    }
}