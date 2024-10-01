const numPhilosophers = 5;
const numEats = 3; // Số lần ăn tối đa của mỗi triết gia
let results = []; // Kết quả tổng hợp

// Semaphore
class Semaphore {
    constructor(value) {
        this.value = value;
        this.queue = [];
    }

    async acquire() {
        if (this.value > 0) {
            this.value--;
        } else {
            await new Promise(resolve => this.queue.push(resolve));
        }
    }

    release() {
        this.value++;
        if (this.queue.length > 0) {
            const resolve = this.queue.shift();
            resolve();
        }
    }
}

const forks = Array.from({ length: numPhilosophers }, () => new Semaphore(1));
let eatCount = Array(numPhilosophers).fill(0); // Đếm số lần ăn của mỗi triết gia

async function philosopherSemaphore(index) {
    while (eatCount[index] < numEats) {
        results.push(`Philosopher ${index} is thinking...`);
        await new Promise(resolve => setTimeout(resolve, Math.random() * 500)); // Giảm thời gian chờ

        await forks[index].acquire();
        await forks[(index + 1) % numPhilosophers].acquire();

        results.push(`Philosopher ${index} is eating...`);
        eatCount[index]++;
        await new Promise(resolve => setTimeout(resolve, Math.random() * 500)); // Giảm thời gian chờ

        forks[index].release();
        forks[(index + 1) % numPhilosophers].release();
    }
}

// Monitor
class Monitor {
    constructor() {
        this.lock = new Semaphore(1);
    }

    async enter() {
        await this.lock.acquire();
    }

    exit() {
        this.lock.release();
    }
}

const monitor = new Monitor();

async function philosopherMonitor(index) {
    while (eatCount[index] < numEats) {
        results.push(`Philosopher ${index} is thinking...`);
        await new Promise(resolve => setTimeout(resolve, Math.random() * 500)); // Giảm thời gian chờ

        await monitor.enter();

        await forks[index].acquire();
        await forks[(index + 1) % numPhilosophers].acquire();

        results.push(`Philosopher ${index} is eating...`);
        eatCount[index]++;
        await new Promise(resolve => setTimeout(resolve, Math.random() * 500)); // Giảm thời gian chờ

        forks[index].release();
        forks[(index + 1) % numPhilosophers].release();

        monitor.exit();
    }
}

// Hiển thị kết quả
function displayResults() {
    const resultBox = document.getElementById('resultBox');
    resultBox.innerHTML = results.join('<br>');
}

// Chạy giải thuật dựa trên lựa chọn
document.getElementById('runButton').addEventListener('click', async () => {
    // Reset kết quả
    eatCount.fill(0);
    results = [];

    const selectedAlgorithm = document.getElementById('optionSelect').value;

    // Chạy Semaphore hoặc Monitor dựa trên lựa chọn
    const promises = [];
    for (let i = 0; i < numPhilosophers; i++) {
        if (selectedAlgorithm === 'Semaphore') {
            promises.push(philosopherSemaphore(i));
        } else {
            promises.push(philosopherMonitor(i));
        }
    }

    // Đợi cho các triết gia chạy xong
    await Promise.all(promises);

    // Hiển thị kết quả sau khi hoàn thành
    displayResults();
});
