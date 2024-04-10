let mediaRecorder;
let audioBlob; // 存储录音的 Blob 对象
let stream;

const recordButton = document.getElementById("recordButton");
const submitButton = document.getElementById("submitButton");
const audioInput = document.getElementById("audioInput");
const audio = document.getElementById("audio");

let isRecording = false;

audioInput.addEventListener('change', () => {
    const file = audioInput.files[0];
    if (file) {
        // 播放选定的音频文件
        audio.src = URL.createObjectURL(file);
        audio.style.display = 'block'; // 显示音频元素
        submitButton.disabled = false; // 启用提交按钮
    }
});


let startTime; // 用于记录开始录音的时间
let elapsedTimeInterval; // 用于记录已经过的录音时间
let timerInterval; // 用于存储 setInterval 的返回值，以便稍后清除


recordButton.addEventListener('click', async () => {
    try {
        if (!isRecording) {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            startRecording();
            recordButton.textContent = 'Stop Recording';
            audioInput.disabled = true;
            isRecording = true;
            recordTime.style.display = 'false'; 
            startTime = Date.now();
            elapsedTimeInterval = setInterval(updateRecordTime, 1000); // 每秒更新一次录音时间
        } else {
            await stopRecording();
	    await releaseMicrophone();
            clearInterval(elapsedTimeInterval); // 停止更新录音时间
            recordButton.textContent = 'Record Audio';
            audioInput.disabled = false;
            isRecording = false;
            recordTime.style.display = 'none'; // 将 recordTime 元素隐藏
        }
    } catch (error) {
        console.error('Failed to get user media:', error);
    }
});


async function startRecording() {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
            audioBlob = new Blob([event.data], { type: 'audio/wav' });
        }
    });
    mediaRecorder.start();
}

function stopRecording() {
    return new Promise((resolve, reject) => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.addEventListener('stop', () => {
                audio.src = URL.createObjectURL(audioBlob);
                audio.style.display = 'block';
                submitButton.disabled = false;
                resolve(); // 当录音停止时解析 Promise
            });
            mediaRecorder.stop();
        } else {
            reject(new Error('MediaRecorder is not active'));
        }
    });
}

async function releaseMicrophone() {
    if (stream) {
        const tracks = stream.getTracks(); // 获取音频流的所有轨道
        tracks.forEach(track => track.stop()); // 停止所有轨道
    }
}

function updateRecordTime() {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000); // 计算已经过的录音时间（秒）
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    recordTime.textContent = `Recorded Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; // 将录音时间显示在 recordTime 元素中
}


/*语音识别*/
const transcript = document.getElementById("transcriptText");
const apiKey = "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";

submitButton.addEventListener('click', async function() {
    try {
        if (audioBlob) {
            // 如果有录音数据，则直接使用录音数据发送请求
            showLoading(true); // 显示加载状态
            await transcribe(audioBlob);
        } else if (audioInput.files.length > 0) {
            // 如果有上传的音频文件，则读取文件并发送请求
            const file = audioInput.files[0];
            const reader = new FileReader();
            reader.onload = async function(event) {
                const data = event.target.result;
                showLoading(true); // 显示加载状态
                await transcribe(data);
            };
            reader.readAsArrayBuffer(file); // 以二进制格式读取文件
        } else {
            console.error("No audio data available.");
        }
    } catch (error) {
        console.error('Error running model:', error);
        showLoading(false); // 隐藏加载状态
    }
});

async function transcribe(data) {
    // 发起 HTTP POST 请求到 Hugging Face 模型 API
    const response = await fetch(
        "https://api-inference.huggingface.co/models/openai/whisper-large-v3",
        {
            // 设置请求头部，包括 API 密钥和音频文件格式
            headers: { 
                Authorization: "Bearer " + apiKey,
                "Content-Type": "audio/*" // 设置请求的内容类型为音频文件
            },
            method: "POST",
            body: data,
        }
    );

    // 解析响应的 JSON 数据
    const result = await response.json();
    showLoading(false); // 隐藏加载状态
    // 将结果显示在页面上
    if (result && result.text) {
        transcript.textContent = result.text;
    } else {
        transcript.textContent = "No transcript available.";
    }
}

function showLoading(isLoading) {
    const loadingText = "Loading..."; // 加载状态的文本
    if (isLoading) {
        transcript.textContent = loadingText;
    } else {
        // 恢复原始文本内容
        transcript.textContent = ""; // 或者您可以显示之前的识别结果
    }
}


