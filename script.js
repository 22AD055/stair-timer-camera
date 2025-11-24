let stage = "wait_start"; // 状態管理
let startTime;
let html5QrCode;

// --- ページ読み込み時にイベントを設定 ---
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("startButton").addEventListener("click", startCamera);
});

// --- カメラ起動処理 ---
function startCamera() {
  // Safari対策：ダイアログを1回挟む
  alert("カメラを起動します！");

  document.getElementById("startButton").style.display = "none";
  document.getElementById("reader").style.display = "block";
  document.getElementById("status").textContent = "7階のQRコードを読み込んでください";


  html5QrCode = new Html5Qrcode("reader");
  html5QrCode.start(
    { facingMode: "environment" }, // 背面カメラを使用
    { fps: 10, qrbox: 250 },
    onScanSuccess
  ).catch(err => {
    alert("カメラを起動できませんでした。設定を確認してください。");
    console.error(err);
  });
}




/* 全画面の「スタート！」演出 */
#startEffect {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: none;
    justify-content: center;
    align-items: center;
    font-size: 4em;
    font-weight: bold;
    background: rgba(255, 255, 255, 0.8);
    z-index: 9999;
    animation: startFade 1s ease-out forwards;
}

@keyframes startFade {
    0% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(1.2); }
}






// --- QR読み取り時の処理 ---
function onScanSuccess(decodedText) {
  console.log("QR検出:", decodedText);

  // START_QRを読み取った場合
  if (stage === "wait_start" && decodedText === "START_QR") {

    stage = "running";
    startTime = Date.now();

    // --- スタート演出 ---
    const eff = document.getElementById("startEffect");
    eff.style.display = "flex";

    // 1秒後に自動で消える
    setTimeout(() => {
        eff.style.display = "none";
    }, 1000);

    // --- タイマー表示を0からスタート ---
    document.getElementById("timer").style.display = "block";
    document.getElementById("timer").textContent = "0.00 秒";

    document.getElementById("status").innerHTML =
        "計測中...<br>2階のQRを読み取ってください";

    // タイマーを動かす
    const timerLoop = setInterval(() => {
        if (stage !== "running") {
            clearInterval(timerLoop);
            return;
        }
        document.getElementById("timer").textContent =
            ((Date.now() - startTime) / 1000).toFixed(2) + " 秒";
    }, 50);
}




  // STOP_QRを読み取った場合
  else if (stage === "running" && decodedText === "STOP_QR") {
  stage = "finished";
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  // 結果を表示（アニメーション付き）
  const statusEl = document.getElementById("status");
  statusEl.innerHTML = `<span class="result-pop" style="font-size:2.5em; font-weight:bold;">結果：${elapsed} 秒！</span>`;

  const resultEl = statusEl.querySelector(".result-pop");
  resultEl.addEventListener("animationend", () => {
    resultEl.classList.remove("result-pop");
  });

  document.getElementById("timer").textContent = `${elapsed} 秒`;

  // --- カメラ停止 ---
  if (html5QrCode) {
    html5QrCode.stop().then(() => {
      html5QrCode.clear();
    });
  }
  document.getElementById("reader").style.display = "none";
  document.getElementById("timer").style.display = "none";

  // --- 入力フォームを表示 ---
  document.getElementById("formArea").style.display = "block";

  // --- 送信ボタンの処理 ---
  document.getElementById("submitRecord").onclick = () => {
    const name = document.getElementById("inputName").value;
    const times = document.getElementById("inputTimes").value;
    const habit = document.getElementById("inputHabit").value;

    if (!name) {
      alert("名前を入力してください！");
      return;
    }

    // フォームへ送信
    sendToGoogleForm(name, elapsed, times, habit);

    statusEl.innerHTML = `<span style="font-size:1.6em;">送信しました！ご協力ありがとうございました！</span>`;
    document.getElementById("formArea").style.display = "none";
  };
}


// --- Googleフォームに送信 ---
function sendToGoogleForm(name, time, times, habit) {
  const formURL = "https://docs.google.com/forms/d/e/【あなたのformResponseURL】/formResponse";
  const formData = new FormData();

  // Googleフォームの entry番号 をここに対応させる
  formData.append("entry.1355586289", name);
  formData.append("entry.1851549436", time);
  formData.append("entry.1542941412", times);
  formData.append("entry.889042589", habit);

  fetch(formURL, {
    method: "POST",
    mode: "no-cors",
    body: formData
  });
}
