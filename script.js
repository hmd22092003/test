class Semaphore {
  constructor(value) {
      this.value = value;
      this.queue = [];
  }

  async wait() {
      if (this.value > 0) {
          this.value--;
      } else {
          await new Promise(resolve => this.queue.push(resolve));
      }
  }

  signal() {
      if (this.queue.length > 0) {
          this.queue.shift()();
      } else {
          this.value++;
      }
  }
}

class Monitor {
  constructor() {
      this.mutex = new Semaphore(1);
      this.philosopherCount = 0; // Đếm số triết gia đang ăn
      this.philosopherQueue = [];
  }

  async enter() {
      await this.mutex.wait();
      this.philosopherCount++;
      if (this.philosopherCount === 1) {
          await new Promise(resolve => {
              this.philosopherQueue.push(resolve);
          });
      }
      this.mutex.signal();
  }

  async exit() {
      await this.mutex.wait();
      this.philosopherCount--;
      if (this.philosopherCount === 0) {
          this.philosopherQueue.forEach(resolve => resolve());
          this.philosopherQueue = [];
      }
      this.mutex.signal();
  }

  async eat(forks) {
      await this.enter(); // Vào Monitor
      await forks[0].wait(); // Lấy muỗng trái
      await forks[1].wait(); // Lấy muỗng phải
  }

  async leave(forks) {
      forks[1].signal(); // Thả muỗng phải
      forks[0].signal(); // Thả muỗng trái
      await this.exit(); // Ra khỏi Monitor
  }
}

// Định nghĩa số lượng triết gia và muỗng
const numPhilosophers = 5;
const forks = Array.from({ length: numPhilosophers }, () => new Semaphore(1));
const monitor = new Monitor();

// Hàm triết gia
async function philosopher(index) {
  const outputBox = document.getElementById('contentBox');

  while (true) {
      outputBox.innerHTML += `Triết gia ${index} đang suy nghĩ...<br>`;
      await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 5000) + 1000)); // Suy nghĩ trong 1-5 giây

      const leftForkIndex = index;
      const rightForkIndex = (index + 1) % numPhilosophers;

      await monitor.eat([forks[leftForkIndex], forks[rightForkIndex]]); // Ăn

      outputBox.innerHTML += `Triết gia ${index} đang ăn...<br>`;
      await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 5000) + 1000)); // Ăn trong 1-5 giây

      await monitor.leave([forks[leftForkIndex], forks[rightForkIndex]]); // Thả muỗng
  }
}

// Khởi động các triết gia
for (let i = 0; i < numPhilosophers; i++) {
  philosopher(i);
}
