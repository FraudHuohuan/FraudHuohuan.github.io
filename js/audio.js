let mediaRecorder;
let audioBlob; // 存储录音的 Blob 对象
let audioBlob1; 
let stream;

const recordButton = document.getElementById("recordButton");
const Recognize = document.getElementById("Recognize");
const Enhance = document.getElementById("Enhance");
const Speech = document.getElementById("Speech");
const audioInput = document.getElementById("audioInput");
const audio = document.getElementById("audio");
const recordButton1 = document.getElementById("recordButton1");
const audioInput1 = document.getElementById("audioInput1");
const audio1 = document.getElementById("audio1");
const audio2 = document.getElementById("audio2");

let isRecording = false;

audioInput.addEventListener('change', () => {
    const file = audioInput.files[0];
    if (file) {
        // 播放选定的音频文件
        audio.src = URL.createObjectURL(file);
        audio.style.display = 'block'; // 显示音频元素
        Recognize.disabled = false; // 启用提交按钮
    }
});

audioInput1.addEventListener('change', () => {
    const file = audioInput1.files[0];
    if (file) {
        // 播放选定的音频文件
        audio1.src = URL.createObjectURL(file);
        audio1.style.display = 'block'; // 显示音频元素
        Enhance.disabled = false; // 启用提交按钮
    }
});

let startTime; // 用于记录开始录音的时间
let elapsedTimeInterval; // 用于记录已经过的录音时间
let timerInterval; // 用于存储 setInterval 的返回值，以便稍后清除


recordButton.addEventListener('click', async () => {
    try {
        if (!isRecording) {
	    recordTime = document.getElementById("recordTime");
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

recordButton1.addEventListener('click', async () => {
    try {
        if (!isRecording) {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            startRecording1();
            recordButton1.textContent = 'Stop Recording';
            audioInput1.disabled = true;
            isRecording = true;
            recordTime1.style.display = 'block'; 
            startTime = Date.now();
            elapsedTimeInterval = setInterval(updateRecordTime1, 1000); // 每秒更新一次录音时间
        } else {
            await stopRecording1();
	    await releaseMicrophone();
            clearInterval(elapsedTimeInterval); // 停止更新录音时间
            recordButton1.textContent = 'Record Audio';
            audioInput1.disabled = false;
            isRecording = false;
            recordTime1.style.display = 'none'; // 将 recordTime 元素隐藏
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
                Recognize.disabled = false;
                resolve(); // 当录音停止时解析 Promise
            });
            mediaRecorder.stop();
        } else {
            reject(new Error('MediaRecorder is not active'));
        }
    });
}

async function startRecording1() {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
            audioBlob1 = new Blob([event.data], { type: 'audio/wav' });
        }
    });
    mediaRecorder.start();
}
function stopRecording1() {
    return new Promise((resolve, reject) => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.addEventListener('stop', () => {
                audio1.src = URL.createObjectURL(audioBlob1);
                audio1.style.display = 'block';
                Enhance.disabled = false;
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

function updateRecordTime1() {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000); // 计算已经过的录音时间（秒）
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    recordTime1.textContent = `Recorded Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; // 将录音时间显示在 recordTime 元素中
}


const apiKey = "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";
/*语音识别*/
const transcript = document.getElementById("transcriptText");

Recognize.addEventListener('click', async function() {
    try {
        if (audioBlob) {
            // 如果有录音数据，则直接使用录音数据发送请求
            showLoading(true); // 显示加载状态
            await trans_Recognize(audioBlob);
        } else if (audioInput.files.length > 0) {
            // 如果有上传的音频文件，则读取文件并发送请求
            const file = audioInput.files[0];
            const reader = new FileReader();
            reader.onload = async function(event) {
                const data = event.target.result;
                showLoading(true); // 显示加载状态
                await trans_Recognize(data);
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

async function trans_Recognize(data) {
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

/*语音增强*/
const enhancedAudio = document.getElementById("enhancedAudio");
const loadingText = document.getElementById("loadingText");

Enhance.addEventListener('click', async function() {
    try {
        if (audioBlob1) {
            // 如果有录音数据，则直接使用录音数据发送请求
            loadingText.style.display = "block"; // 显示加载状态
            await trans_Enhance(audioBlob1);
        } else if (audioInput1.files.length > 0) {
            // 如果有上传的音频文件，则读取文件并发送请求
            const file1 = audioInput1.files[0];
            const reader = new FileReader();
            reader.onload = async function(event) {
                const data1 = event.target.result;
                loadingText.style.display = "block";// 显示加载状态
                await trans_Enhance(data1);
            };
            reader.readAsArrayBuffer(file1); // 以二进制格式读取文件
        } else {
            console.error("No audio data available.");
        }
    } catch (error) {
        console.error('Error running model:', error);
        loadingText.style.display = "none"; // 隐藏加载状态
    }
});

async function trans_Enhance(data) {
    // 发起 HTTP POST 请求到 Hugging Face 模型 API
    const response = await fetch(
        "https://api-inference.huggingface.co/models/speechbrain/sepformer-whamr-enhancement",
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
    const result1 = await response.json();
    loadingText.style.display = "none"; // 隐藏加载状态
    // 将结果显示在页面上
    if (result1 && result1.length > 0) {
    // 获取第一个元素的音频数据
    const audioData1 = result1[0].blob;
    const contentType = result1[0]["content-type"];

    // 解码 Base64 编码的音频数据
    const decodedAudioData = atob(audioData1);

    // 将解码后的音频数据转换为 Uint8Array 类型
    const arrayBuffer = new Uint8Array(decodedAudioData.length);
    for (let i = 0; i < decodedAudioData.length; i++) {
        arrayBuffer[i] = decodedAudioData.charCodeAt(i);
    }

    // 创建 Blob 对象
    const blob1 = new Blob([arrayBuffer], { type: contentType });

    // 创建音频的 URL 对象
    const audioURL = URL.createObjectURL(blob1);

    // 设置音频元素的 src
    enhancedAudio.src = audioURL;

    // 显示音频元素
    enhancedAudio.style.display = "block";
    } else {
    // 如果 result 为空，则显示相应的消息
    transcript.textContent = "No audio available.";
}
}


/*TTS*/
