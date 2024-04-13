const apiKey = "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";
/*语音录入*/
let mediaRecorder;
let audioBlob;
let isRecording = false;

const recordButton = document.getElementById("recordButton");
const textInput = document.getElementById("textInput");

recordButton.addEventListener('click', toggleRecording);

async function toggleRecording() {
    try {
        if (!isRecording) {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            startRecording(stream);
            recordButton.textContent = 'Stop Recording';
            isRecording = true;
        } else {
            await stopRecording();
            recordButton.textContent = 'Voice Input';
            isRecording = false;
	    processAudio(audioBlob); // Call the function to process the recorded audio
        }
    } catch (error) {
        console.error('Failed to get user media:', error);
    }
}

async function startRecording(stream) {
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.addEventListener('dataavailable', event => {
        audioBlob = new Blob([event.data], { type: 'audio/wav' });
    });

    mediaRecorder.start();
}

function stopRecording() {
    return new Promise((resolve, reject) => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.addEventListener('stop', () => {
                textInput.value = 'Loading...'; // Display "Loading..." in the text area
                resolve(); // 当录音停止时解析 Promise
            });
            mediaRecorder.stop();
        } else {
            reject(new Error('MediaRecorder is not active'));
        }
    });
}


async function processAudio(audioBlob) {
    try {
        // 调用模型处理音频数据
        const enhancedBlob = await trans_Enhance(audioBlob);
	console.log(enhancedBlob);
        // 调用语音识别函数识别处理后的音频
        const transcription = await trans_Recognize(enhancedBlob);

        // 将语音识别的结果显示在文本输入框中
        textInput.value = transcription;

        // 返回语音识别的结果
        return transcription;
    } catch (error) {
        console.error('Error processing audio:', error);
        // 处理过程中发生错误时返回 null
	textInput.value = null;
        return null;
    }
}

async function trans_Enhance(data) {
    // 发起 HTTP POST 请求到第一个模型 API
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
    const result = await response.json();
    // 将结果显示在页面上
    if (result && result.length > 0) {
    // 获取第一个元素的音频数据
    const audioData = result[0].blob;
    const contentType = result[0]["content-type"];

    // 解码 Base64 编码的音频数据
    const decodedAudioData = atob(audioData);

    // 将解码后的音频数据转换为 Uint8Array 类型
    const arrayBuffer = new Uint8Array(decodedAudioData.length);
    for (let i = 0; i < decodedAudioData.length; i++) {
        arrayBuffer[i] = decodedAudioData.charCodeAt(i);
    }

    // 创建 Blob 对象
    const blob = new Blob([arrayBuffer], { type: contentType });
    return blob; 
    }else {
    // 如果 result 为空，则显示相应的消息
    textInput.textContent = "No audio available.";}
}

async function trans_Recognize(data) {
    try {
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

        // 将结果显示在页面上
        if (result && result.text) {
            // 返回识别的文本结果
            return result.text;
        } else {
            return "No transcript available.";
        }
    } catch (error) {
        console.error('Error recognizing audio:', error);
        // 处理过程中发生错误时返回 null
        return null;
    }
}



/*发送信息*/

