import React from 'react';

class Line {
    constructor(props) {
        this.x = props.xPos;
        this.length = 'long';
        this.width = props.width;
        this.height = props.height;
    }

    run = (context, speed, midHeight, canvasHeight) => {
        context.beginPath();

        if (this.length == 'long') {
            this.height += speed;
        } else {
            this.height -= speed;
        }

        context.rect(this.x, midHeight-this.height/2, this.width, this.height);
        context.fillStyle = 'black';
        context.fill();

        if (this.height >= canvasHeight) {
            this.length = 'short';
        } else if (this.height <= 0) {
            this.length = 'long';
        }
    }
}

export default class Wave extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lineArr: []
        }
        this.speed = 1.4;
        this.width = 3;
        this.bar = 100;
        this.margin = 1;
        this.midHeight = 20;
        this.canvasWidth = 200;
        this.canvasHeight = 18;
        
        this.canvas = React.createRef();
        this.action = this.action.bind(this);
    }

    start = () => {
        let xPos = 0;
        let lineArr = [];
        for (let i=0; i < this.bar; i++) {
            let height = Math.floor(Math.random() * (this.canvasHeight - 0 + 1)) + 0;
            let lines = new Line({xPos, height, width: this.width});
            this.setState((state) => {
                state.lineArr.push(lines);
            })
            lineArr.push(lines);
            xPos += (this.width + this.margin);
        }
        this.action();
    }

    midline = () => {
        this.context.beginPath();
        this.context.moveTo(0, this.midHeight);
        this.context.lineTo(this.canvasWidth, this.midHeight);
        this.context.lineWidth = 1;
        this.context.strokeStyle = 'black';
        this.context.stroke();
    }

    action = () => {
        this.context.clearRect(0, 0, this.canvas.current.width, this.canvas.current.height);
        this.midline();
        this.state.lineArr.forEach((line) => {
            line.run(this.context, this.speed, this.midHeight, this.canvasHeight);
        });

        this.raf = requestAnimationFrame(this.action);
    }

    componentDidMount = () => {
        this.context = this.canvas.current.getContext("2d");
        this.start();
    }



    render() {
        return (
            <canvas ref={this.canvas} width="200" height="40" />
        )
    }
}