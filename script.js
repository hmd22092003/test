document.getElementById("runButton").addEventListener("click", () => {
  const option = document.getElementById("optionSelect").value;
  const contentBox = document.getElementById("contentBox");
  contentBox.innerHTML = "Đang chạy...";

  // Chạy cả hai phương pháp cùng một lúc
  const semaphoreResults = runSemaphoreAlgorithm();
  const monitorResults = runMonitorAlgorithm();

  // Hiển thị kết quả
  setTimeout(() => {
      contentBox.innerHTML = `
          <h5>Kết quả với Semaphore:</h5>
          <p>${semaphoreResults.join("<br>")}</p>
          <h5>Kết quả với Monitor:</h5>
          <p>${monitorResults.join("<br>")}</p>
      `;
  }, 1000); // Đợi 1 giây để mô phỏng quá trình
});

function runSemaphoreAlgorithm() {
  const philosophers = ["Triết gia 1", "Triết gia 2", "Triết gia 3", "Triết gia 4", "Triết gia 5"];
  const results = [];
  const maxEating = 3; // Giả sử mỗi triết gia ăn 3 lần
  const maxPhilosophersEating = 2; // Giới hạn số triết gia có thể ăn cùng một lúc

  for (let i = 0; i < maxEating; i++) {
      const eatingPhilosophers = [];
      
      philosophers.forEach(philosopher => {
          if (eatingPhilosophers.length < maxPhilosophersEating) {
              results.push(`${philosopher} đang ăn...`);
              eatingPhilosophers.push(philosopher);
          }
      });

      eatingPhilosophers.forEach(philosopher => {
          results.push(`${philosopher} đã ăn xong.`);
      });
  }

  return results;
}

function runMonitorAlgorithm() {
  const philosophers = ["Triết gia 1", "Triết gia 2", "Triết gia 3", "Triết gia 4", "Triết gia 5"];
  const results = [];
  const maxEating = 3; // Giả sử mỗi triết gia ăn 3 lần
  const maxPhilosophersEating = 2; // Giới hạn số triết gia có thể ăn cùng một lúc

  for (let i = 0; i < maxEating; i++) {
      const eatingPhilosophers = [];
      
      philosophers.forEach(philosopher => {
          if (eatingPhilosophers.length < maxPhilosophersEating) {
              results.push(`${philosopher} đang ăn...`);
              eatingPhilosophers.push(philosopher);
          }
      });

      eatingPhilosophers.forEach(philosopher => {
          results.push(`${philosopher} đã ăn xong.`);
      });
  }

  return results;
}
