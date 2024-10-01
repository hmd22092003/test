class Semaphore {
  constructor(count) {
      this.count = count;
      this.queue = [];
  }

  async wait() {
      if (this.count > 0) {
          this.count--;
      } else {
          await new Promise(resolve => this.queue.push(resolve));
      }
  }

  signal() {
      if (this.queue.length > 0) {
          const resolve = this.queue.shift();
          resolve();
      } else {
          this.count++;
      }
  }
}

const forks = Array.from({ length: 5 }, () => new Semaphore(1));
const diningSemaphore = new Semaphore(2);

async function philosopherSemaphore(id) {
  const outputBox = document.getElementById('contentBox');
  while (true) {
      outputBox.innerHTML += `Triết gia ${id} đang suy nghĩ...<br>`;
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

      outputBox.innerHTML += `Triết gia ${id} muốn ăn...<br>`;
      await diningSemaphore.wait();

      await forks[id].wait();
      outputBox.innerHTML += `Triết gia ${id} đã lấy muỗng trái<br>`;

      await forks[(id + 1) % 5].wait();
      outputBox.innerHTML += `Triết gia ${id} đã lấy muỗng phải<br>`;

      outputBox.innerHTML += `Triết gia ${id} đang ăn...<br>`;
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

      forks[(id + 1) % 5].signal();
      forks[id].signal();
      diningSemaphore.signal();
      outputBox.innerHTML += `Triết gia ${id} đã ăn xong.<br>`;
  }
}

class Monitor {
  constructor() {
      this.mutex = new Semaphore(1);
      this.eatingCount = 0;
  }

  async enter() {
      await this.mutex.wait();
  }

  leave() {
      this.mutex.signal();
  }

  async eat(philosopher) {
      await this.enter();
      while (this.eatingCount >= 2) {
          this.leave();
          await new Promise(resolve => setTimeout(resolve, 100));
          await this.enter();
      }
      this.eatingCount++;
      const outputBox = document.getElementById('contentBox');
      outputBox.innerHTML += `Triết gia ${philosopher} đang ăn...<br>`;
      this.leave();
  }

  async doneEating(philosopher) {
      await this.enter();
      this.eatingCount--;
      const outputBox = document.getElementById('contentBox');
      outputBox.innerHTML += `Triết gia ${philosopher} đã ăn xong.<br>`;
      this.leave();
  }
}

const monitor = new Monitor();

async function philosopherMonitor(id) {
  const outputBox = document.getElementById('contentBox');
  while (true) {
      outputBox.innerHTML += `Triết gia ${id} đang suy nghĩ...<br>`;
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

      outputBox.innerHTML += `Triết gia ${id} muốn ăn...<br>`;
      await monitor.eat(id);

      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

      await monitor.doneEating(id);
  }
}

// Chạy thuật toán dựa trên lựa chọn
document.getElementById('runButton').onclick = function () {
  const selectedAlgorithm = document.getElementById('optionSelect').value;

  // Xóa nội dung cũ
  document.getElementById('contentBox').innerHTML = '';

  // Khởi động các triết gia
  if (selectedAlgorithm === 'Semaphore') {
      for (let i = 0; i < 5; i++) {
          philosopherSemaphore(i);
      }
  } else if (selectedAlgorithm === 'Monitor') {
      for (let i = 0; i < 5; i++) {
          philosopherMonitor(i);
      }
  }
};
