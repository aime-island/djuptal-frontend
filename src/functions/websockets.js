export const createSocket = (path) => {
    return new Promise((resolve, reject) => {
        let socket = new WebSocket("ws://10.178.107.100:9000/" + path)
        //let socket = new WebSocket("ws://127.0.0.1:9000/" + path)

        socket.binaryType = "arraybuffer";

        socket.onopen = () => {
            console.log('Connected');
            resolve(socket);
        }

        socket.onerror = (e) => {
            reject(e);
        }
    });
}