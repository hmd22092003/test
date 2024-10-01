class Semaphore {
  constructor(value) {
      this.value = value;
      this.waiting = [];
  }

  acquire() {
      if (this.value > 0) {
          this.value--;
          return Promise.resolve();
      } else {
          return new Promise((resolve) => {
              this.waiting.push(resolve);
          });
      }
  }

  release() {
      this.value++;
      if (this.waiting.length > 0) {
          const resolve = this.waiting.shift();
          resolve();
      }
  }
}

const N = 5; // Số triết gia
const forks = Array.from({ length: N }, () => new Semaphore(1));

function updateContent(message) {
  const contentBox = document.getElementById('contentBox');
  contentBox.innerHTML += `<p>${message}</p>`;
}

async function philosopherSemaphore(index) {
  updateContent(`Triết gia ${index} đang suy nghĩ...`);
  await sleep(Math.floor(Math.random() * 2000) + 1000); // Suy nghĩ

  await forks[index].acquire(); // Cầm cái nĩa bên trái
  await forks[(index + 1) % N].acquire(); // Cầm cái nĩa bên phải

  updateContent(`Triết gia ${index} đang ăn...`);
  await sleep(Math.floor(Math.random() * 2000) + 1000); // Ăn

  updateContent(`Triết gia ${index} đã ăn xong.`);
  forks[index].release(); // Thả cái nĩa bên trái
  forks[(index + 1) % N].release(); // Thả cái nĩa bên phải
}

async function philosopherMonitor(index) {
  updateContent(`Triết gia ${index} đang suy nghĩ...`);
  await sleep(Math.floor(Math.random() * 2000) + 1000); // Suy nghĩ

  await forks[index].acquire(); // Cầm cái nĩa bên trái
  await forks[(index + 1) % N].acquire(); // Cầm cái nĩa bên phải

  updateContent(`Triết gia ${index} đang ăn...`);
  await sleep(Math.floor(Math.random() * 2000) + 1000); // Ăn

  updateContent(`Triết gia ${index} đã ăn xong.`);
  forks[index].release(); // Thả cái nĩa bên trái
  forks[(index + 1) % N].release(); // Thả cái nĩa bên phải
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

document.getElementById('runButton').addEventListener('click', () => {
  const selectedAlgorithm = document.getElementById('optionSelect').value;

  // Clear the content box before starting
  const contentBox = document.getElementById('contentBox');
  contentBox.innerHTML = "Kết quả sẽ hiển thị ở đây...";

  // Run the selected algorithm
  const philosopherPromises = [];
  if (selectedAlgorithm === "Monitor") {
      for (let i = 0; i < N; i++) {
          philosopherPromises.push(philosopherMonitor(i));
      }
  } else if (selectedAlgorithm === "Semaphore") {
      for (let i = 0; i < N; i++) {
          philosopherPromises.push(philosopherSemaphore(i));
      }
  }

  // Chờ tất cả triết gia ăn xong
  Promise.all(philosopherPromises).then(() => {
      updateContent("Tất cả triết gia đã ăn xong.");
  });
});
