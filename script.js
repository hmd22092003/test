const numPhilosophers = 5;
const numEats = 3; // Số lần ăn tối đa của mỗi triết gia

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
let semaphoreResults = []; // Kết quả cho Semaphore

async function philosopher(index) {
    while (eatCount[index] < numEats) {
        semaphoreResults.push(`Philosopher ${index} is thinking...`);
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

        await forks[index].acquire();
        await forks[(index + 1) % numPhilosophers].acquire();

        semaphoreResults.push(`Philosopher ${index} is eating...`);
        eatCount[index]++;
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

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
let monitorResults = []; // Kết quả cho Monitor

async function philosopherMonitor(index) {
    while (eatCount[index] < numEats) {
        monitorResults.push(`Philosopher ${index} is thinking...`);
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

        await monitor.enter();

        await forks[index].acquire();
        await forks[(index + 1) % numPhilosophers].acquire();

        monitorResults.push(`Philosopher ${index} is eating...`);
        eatCount[index]++;
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

        forks[index].release();
        forks[(index + 1) % numPhilosophers].release();

        monitor.exit();
    }
}

// Hiển thị kết quả
function displayResults() {
    const contentBox = document.getElementById('contentBox');
    contentBox.innerHTML = "<h3>Kết quả với Semaphore:</h3>" + semaphoreResults.join('<br>') +
        "<h3>Kết quả với Monitor:</h3>" + monitorResults.join('<br>');
}

// Chạy cả hai giải thuật khi nhấn nút
document.getElementById('runButton').addEventListener('click', async () => {
    // Reset kết quả
    eatCount.fill(0);
    semaphoreResults = [];
    monitorResults = [];

    // Chạy Semaphore
    const semaphorePromises = [];
    for (let i = 0; i < numPhilosophers; i++) {
        semaphorePromises.push(philosopher(i));
    }

    // Chạy Monitor
    const monitorPromises = [];
    for (let i = 0; i < numPhilosophers; i++) {
        monitorPromises.push(philosopherMonitor(i));
    }

    // Đợi cho cả hai chạy xong
    await Promise.all(semaphorePromises);
    await Promise.all(monitorPromises);

    // Hiển thị kết quả sau khi hoàn thành
    displayResults();
});
