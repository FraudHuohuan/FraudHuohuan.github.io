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
        audio.src = URL.createObjectURL(file); // 播放选定的音频文件
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
            stopRecording();
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

function updateRecordTime() {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000); // 计算已经过的录音时间（秒）
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    recordTime.textContent = `Recorded Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; // 将录音时间显示在 recordTime 元素中
}

submitButton.addEventListener('click', function() {
    if (audioBlob) {
        // 在这里执行你需要的操作，比如上传录音或者其他处理
    }
});

