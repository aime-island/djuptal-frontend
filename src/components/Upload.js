import React from 'react';

export default class Upload extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            file: '',
            button: 'Velja skrá',
            allowed: ['.wav', '.mp3'],
            message: null,
            tempFile: null
        }
        this.clickInput = React.createRef();
    }

    isAllowed = (file) => {
        let extension = file.match(/\.[^/.]+$/, '')[0];
        return this.state.allowed.includes(extension);
    }

    handleRemove = (file) => {
        let newFiles = this.state.files.filter((item) => {
            return item != file;
        })
        this.setState({
            files: newFiles
        })
    }

    handleChange = (e) => {
        this.state.file ? (
            this.setState({
                file: '',
                message: null,
                button: 'Velja skrá'
            })
         ) : ( 
            this.isAllowed(e.target.value) ? [
                name = e.target.value.split(/\\|\//).pop(),
                this.setState({
                    file: e.target.value,
                    tempFile: e.target.files[0],
                    message: name,
                    button: 'Fjarlægja'
                })
            ] : (
                this.setState({
                    message: 'Leyfðar skráarendingar eru: wav, mp3'
                })
            )
        )
    }

    handleClick = () => {
        !this.state.file ? (
            this.clickInput.current.click()
        ) : (
            this.handleChange()
        ) 
    }

    handleSubmit = () => {
        this.props.add(this.state.tempFile);
        this.setState({
            file: '',
            tempFile: null,
            button: 'Velja skrá',
            message: null
        })
    }

    render() {
        return (
            <div className="upload">
                <div className="upload-header">
                    <h2>
                        Sendu inn hljóðskrá
                    </h2>
                </div>
                
                <div className="upload-btns">
                <input type="file" value={this.state.file} className="real-input" ref={this.clickInput} onChange={this.handleChange} /> 
                    <button className="button browse-btn" onClick={this.handleClick}>
                        {this.state.button}
                    </button>
                    <button className="button" disabled={!this.state.file} onClick={this.handleSubmit}>
                        Senda
                    </button>
                </div>
                <div className="message-container">
                    <div className="file-message">
                        {this.state.message}
                    </div>
                </div>
            </div>
        )
    }
}