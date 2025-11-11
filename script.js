// 状態管理
let stage = "wait_start"; // wait_start → running → finished
let startTime;

// QRコードリーダーを初期化
const html5QrCode = new Html5Qrcode("reader");

function onScanSuccess(decodedText) {
  // スキャン成功時に呼ばれる関数
  console.log("QR検出:", decodedText);

  // スタートQRを読み取ったらタイマー開始
  if (stage === "wait_start" && decodedText === "START_QR") {
    startTime = Date.now();
    stage = "running";
    document.getElementById("status").textContent = "計測中！2階のQRを読み取ってください";

    // タイマー表示
    const timerDisplay = document.getElementById("timer");
    const timerInterval = setInterval(() => {
      if (stage !== "running") {
        clearInterval(timerInterval);
        return;
      }
      const elapsed = (Date.now() - startTime) / 1000;
      timerDisplay.textContent = `${elapsed.toFixed(2)} 秒`;
    }, 100);
  }

  // ストップQRを読み取ったらタイマー停止＆記録送信
  else if (stage === "running" && decodedText === "STOP_QR") {
    stage = "finished";
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    document.getElementById("status").textContent = `結果：${elapsed} 秒！`;
    document.getElementById("timer").textContent = `${elapsed} 秒`;

    const name = prompt("名前を入力してください（ランキング用）:");
    if (name) {
      fetch("https://script.google.com/macros/s/AKfycbzvTa_318jVZsieMHD8V5_n5HwztvyyL1_BCzvWdzCMo6qvf9BMm_unrX-TS8uF-mUtsg/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, time: elapsed })
      })
      .then(r => r.text())
      .then(() => alert("記録を送信しました！"))
      .catch(() => alert("送信に失敗しました。"));
    }
  }
}

// カメラ起動
html5QrCode.start(
  { facingMode: "environment" }, // 背面カメラ
  { fps: 10, qrbox: 250 },
  onScanSuccess
);
