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

async function philosopher(index) {
    while (eatCount[index] < numEats) {
        console.log(`Philosopher ${index} is thinking...`);
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

        await forks[index].acquire();
        await forks[(index + 1) % numPhilosophers].acquire();

        console.log(`Philosopher ${index} is eating...`);
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

async function philosopherMonitor(index) {
    while (eatCount[index] < numEats) {
        console.log(`Philosopher ${index} is thinking...`);
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

        await monitor.enter();

        await forks[index].acquire();
        await forks[(index + 1) % numPhilosophers].acquire();

        console.log(`Philosopher ${index} is eating...`);
        eatCount[index]++;
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

        forks[index].release();
        forks[(index + 1) % numPhilosophers].release();

        monitor.exit();
    }
}

// Chạy cả hai giải thuật
for (let i = 0; i < numPhilosophers; i++) {
    philosopher(i);
    philosopherMonitor(i);
}
