import _ from 'lodash';
import './styles/style.css';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import Recorder from 'recorderjs';

// Declarations for record section
let URL = window.URL || window.webkitURL;
let AudioContext = window.AudioContext || window.webkitAudioContext || false;

const recordButton = document.getElementById('record-btn');
const recordHeader = document.getElementById('record-header');
const saveButton = document.getElementById('save-btn');
const duration = document.getElementById('duration');
const recordingsList = document.getElementById('recordings-list');
let rec, gumStream;

// Declarations for upload section
const uploadButton = document.getElementById('browse-btn');
const submitButton = document.getElementById('submit-btn');
const fileInfo = document.getElementById('file-info');
const realInput = document.getElementById('real-input');
let remove = false;


// Declarations for stream section
const startStreamButton = document.getElementById('start-btn');
const endStreamButton = document.getElementById('end-btn');
const streamingResult = document.getElementById('streaming-result');
let openSocket;

startStreamButton.addEventListener('click', () => {
	startStreamButton.disabled = true;
	endStreamButton.disabled = false;
	startStream().then(streamingRecognize);
})

endStreamButton.addEventListener('click', () => {
	startStreamButton.disabled = false;
	endStreamButton.disabled = true;
	stopStream();
})

let inputStream;
let streamAudioContext;
const startStream = () => {
	streamAudioContext = new AudioContext();
	return navigator.mediaDevices.getUserMedia({audio: true, video: false})
		.then(function(stream) {
			inputStream = stream;
            let inputSrc = streamAudioContext.createMediaStreamSource(stream);
			let sampleRate = streamAudioContext.sampleRate;
			console.log("Sampling rate is " + sampleRate + "Hz");
			console.log("Media stream created.");
			return inputSrc;
		});
}

const stopStream = () => {
    inputStream.getTracks().forEach(function(track) { track.stop(); });
	streamAudioContext.close().catch(function(e) { console.log(e); });
	openSocket.close();
	console.log('Disconnected');
}

const streamingRecognize = (source) => {
    let streamProcessor = streamAudioContext.createScriptProcessor(16384, 1, 1);
    source.connect(streamProcessor);
	streamProcessor.connect(streamAudioContext.destination);
	
	let socket = io();
	openSocket = socket;
	socket.on('connect', () => {
		console.log('Connected');
	});
	socket.on('error', (error) => {
		stopStream();
	});
	socket.on('skilabod', (data) => {
		console.log(data);
	});
	socket.on('transcript', (data) => {
		generateStreamingResult(data);
	});
	
    streamProcessor.onaudioprocess = (e) => {
      if (!e.inputBuffer.getChannelData(0).every(
        function(elem) { return elem === 0; })) {
			var buffer = new ArrayBuffer(e.inputBuffer.length * 2);
			var view = new DataView(buffer);
			floatTo16BitPCM(view, 0, e.inputBuffer.getChannelData(0));
			socket.emit('audio', buffer);
      }
    };
  }
  function floatTo16BitPCM(output, offset, input) {
    for (var i = 0; i < input.length; i++, offset += 2) {
      var s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  }
  
const startRecording = () => {
    //	standard promise based getUserMedia() 
	navigator.mediaDevices.getUserMedia({ audio: true, video:false }).then(function(stream) {
		let audioContext = new AudioContext();
		let input = audioContext.createMediaStreamSource(stream);
		gumStream = stream;

		//	Mono sound (1 channel)
		rec = new Recorder(input,{numChannels:1})
		rec.record()

	}).catch(function(err) {
    	recordButton.disabled = false;
    	saveButton.disabled = true;
	});
}

const generateStreamingResult = (data) => {
	data += ' ';
	transcript = document.createTextNode(data);
	if (transcript) {
		streamingResult.appendChild(transcript);
	}
}

// Browse button
uploadButton.addEventListener('click', () => {
	if (!remove) {
		realInput.click();
	} else {
		submitButton.disabled = true;
		uploadButton.innerHTML = 'Velja skrá';
		realInput.value = '';
		fileInfo.style.fontFamily = null;
		fileInfo.style.color = 'white';
		fileInfo.innerHTML = '.'
		remove = false;
	}
});

// Browse function
realInput.addEventListener('change', () => {
	if (realInput.value) {
		let allowed = ['.wav', '.mp3']
		let ext = realInput.value.match(/\.[^/.]+$/, '')[0]
		if (allowed.includes(ext)) {
			const name = realInput.value.split(/\\|\//).pop();
			fileInfo.style.fontFamily = 'monospace';
			fileInfo.innerHTML = name;
			fileInfo.style.color = 'black';
			submitButton.disabled = false;
			uploadButton.innerHTML = 'Fjarlægja'
			remove = true;
		} else {
			fileInfo.style.fontFamily = null;
			fileInfo.innerHTML = '<span id="error">Villa!</span> Leyfðar skráarendingar eru: wav, mp3';
			fileInfo.style.color = 'black';
		}
	}
});

// Submit button
submitButton.addEventListener('click', () => {
	generateItem(realInput.files[0]);
	fileInfo.innerHTML = '';
	fileInfo.style.color = 'white';
	uploadButton.disabled = false;
	submitButton.disabled = true;
	uploadButton.innerHTML = 'Velja skrá';
	remove = false;
});


// Record button
recordButton.addEventListener('click', () => {
	if (!rec) {
        
		startRecording();
		recordButton.innerHTML = 'Stoppa';
		saveButton.disabled = true;
        recordHeader.appendChild(wave);
	} else {
        
		if (rec.recording) {
			rec.stop();
			rec.exportWAV(showDuration);
			recordButton.innerHTML = 'Halda áfram';
			saveButton.disabled = false;
			recordHeader.removeChild(wave);
		} else {
			rec.record()
			duration.innerHTML = '';
			recordButton.innerHTML = 'Stoppa';
			saveButton.disabled = true;
			recordHeader.appendChild(wave);
		}
	}
});

// Save button
saveButton.addEventListener('click', () => {
	duration.innerHTML = '';
	saveRecording();
});

const saveRecording = () => {
	saveButton.disabled = true;
	recordButton.disabled = false;
	recordButton.innerHTML = 'Taka upp';

	rec.stop();

	// Stop microphone access
	gumStream.getAudioTracks()[0].stop();

	rec.exportWAV(generateItem);
	rec = '';
}

const showDuration = (blob) => {
	let url = URL.createObjectURL(blob);
	let au = document.createElement('audio');
	au.addEventListener('loadedmetadata',() => {
		let dur = au.duration.toFixed(1);
		duration.innerHTML = dur + ' sekúndur';
	});
	au.src = url;
}

const transcribe = (file) => {

	let formData = new FormData();
	formData.append('file', file);
	return fetch('/', {method: 'POST', body: formData})
		.then(response => response.json())
		.then(response => {
			let string = JSON.stringify(response.transcript)
			string = string.slice(1, -1);
			return string;
		})
		.catch(error => console.error('Error:', error));
}

const createAudio = (aud) => {
	let url = URL.createObjectURL(aud);
	let au = document.createElement('audio');
	au.controls = true;
	au.src = url;
	return au;
}

const createItem = () => {
	let itemContainer = document.createElement('div');
	itemContainer.setAttribute('id', 'item-container');

	let item = document.createElement('div');
	item.setAttribute('id', 'item');

	let transcript = document.createElement('div');
	transcript.setAttribute('id', 'transcript');

	itemContainer.appendChild(item);
	itemContainer.appendChild(transcript);

	return {itemContainer, item, transcript};
}

const createLoader = () => {
	// Loading gif
	let loader = document.createElement('img')
	loader.setAttribute('src', '/images/loader.gif');
	loader.setAttribute('id', 'loader');

	// Loading container
	let loaderContainer = document.createElement('div');
	loaderContainer.appendChild(loader);
	loaderContainer.setAttribute('id', 'loader-container');
	loaderContainer.appendChild(loader);

	return loaderContainer
}

const generateItem = (blob) => {
	let au = createAudio(blob);
	let {itemContainer, item, transcript} = createItem();
	item.appendChild(au);
	let loaderContainer = createLoader();

	// Delete button
	let deleteButton = document.createElement('button');
	deleteButton.innerHTML = 'Eyða';
	deleteButton.setAttribute('id', 'delete-btn');
	deleteButton.addEventListener('click', async () => {
		collapseItem(itemContainer, recordingsList);
	});
	
	// Correct button
	let correctButton = document.createElement('button');
	correctButton.innerHTML = 'Rétt';
	correctButton.setAttribute('id', 'correct-btn');
	correctButton.addEventListener('click', async () => {
		correctButton.disabled = true;
	});

	// Transcribe button
	let transcribeButton = document.createElement('button');
	transcribeButton.innerHTML = 'Þýða';
	transcribeButton.setAttribute('id', 'transcribe-btn');
	transcribeButton.addEventListener('click', async () => {
		item.removeChild(transcribeButton);
		item.removeChild(deleteButton);
		item.appendChild(loaderContainer);
		let tr = await transcribe(blob);
		transcript.innerHTML = tr;
		expandItem(transcript, itemContainer);
		item.removeChild(loaderContainer);
		item.appendChild(deleteButton);
		item.appendChild(correctButton);
		transcribeButton.disabled = true;
	});


	item.appendChild(deleteButton);
	item.appendChild(transcribeButton);
	
	expandItem(itemContainer, recordingsList);
}

const expandItem = (element, container) => {
	container.appendChild(element);
	let sectionHeight = element.scrollHeight;
	element.style.height = sectionHeight + 'px';
}

const collapseItem = (element, container) => {
	let sectionHeight = element.scrollHeight;
	let elementTransition = element.style.transition;
	element.style.transition = '';
	element.addEventListener('transitionend', () => {
		container.removeChild(element);
	});
	requestAnimationFrame(() => {
	  element.style.height = sectionHeight + 'px';
	  element.style.transition = elementTransition;

	  requestAnimationFrame(() => {
		element.style.height = 0 + 'px';
	  });
	});
}