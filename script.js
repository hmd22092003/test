// Global variables
let philosophers = [];
let contentBox = document.getElementById('contentBox');
let numPhilosophersInput = document.getElementById('numPhilosophers');
let eatCount = []; // To track how many times each philosopher has eaten

// Event listener for the Run button
document.getElementById('runButton').addEventListener('click', function() {
    const numPhilosophers = parseInt(numPhilosophersInput.value);
    const selectedAlgorithm = document.getElementById('optionSelect').value;

    contentBox.innerHTML = ''; // Clear previous results

    // Reset eatCount for each run
    eatCount = Array(numPhilosophers).fill(0); 

    if (selectedAlgorithm === "Semaphore") {
        runSemaphore(numPhilosophers);
    } else if (selectedAlgorithm === "Monitor") {
        runMonitor(numPhilosophers);
    }
});

// Function to run Semaphore algorithm
function runSemaphore(num) {
    const forks = Array.from({ length: num }, () => new Semaphore(1));
    philosophers = Array.from({ length: num }, (_, i) => i);
    
    // Start the philosophers in order
    (async () => {
        for (let index = 0; index < num; index++) {
            await philosopherSemaphore(index, forks);
        }
    })();
}

// Function to handle Semaphore logic
async function philosopherSemaphore(index, forks) {
    while (eatCount[index] < 1) { // Change this to set how many times you want them to eat
        // Thinking
        contentBox.innerHTML += `Triết gia số ${index}: đang suy nghĩ...<br>`;
        await sleep(randomSleep());

        const leftFork = forks[index];
        const rightFork = forks[(index + 1) % forks.length];

        // Try to acquire forks
        await leftFork.acquire();
        contentBox.innerHTML += `Triết gia số ${index}: đang giữ một chiếc đũa bên trái mình.<br>`;
        
        await rightFork.acquire();
        contentBox.innerHTML += `Triết gia số ${index}: đã có đủ hai chiếc đũa và đang ăn...<br>`;
        await sleep(randomSleep());

        eatCount[index]++; // Increase the eat count
        leftFork.release();
        rightFork.release();

        // Put down forks
        contentBox.innerHTML += `Triết gia số ${index}: đã thả đũa bên trái.<br>`;
        contentBox.innerHTML += `Triết gia số ${index}: đã thả đũa bên phải.<br>`;
    }
    checkAllPhilosophersDone(); // Check after each philosopher finishes eating
}

// Function to run Monitor algorithm
function runMonitor(num) {
    const forks = Array.from({ length: num }, () => new Monitor());
    philosophers = Array.from({ length: num }, (_, i) => i);
    
    // Start the philosophers in order
    (async () => {
        for (let index = 0; index < num; index++) {
            await philosopherMonitor(index, forks);
        }
    })();
}

// Function to handle Monitor logic
async function philosopherMonitor(index, forks) {
    while (eatCount[index] < 1) { // Change this to set how many times you want them to eat
        // Thinking
        contentBox.innerHTML += `Triết gia số ${index}: đang suy nghĩ...<br>`;
        await sleep(randomSleep());

        const monitor = forks[index];

        await monitor.take();
        contentBox.innerHTML += `Triết gia số ${index}: đang giữ một chiếc đũa bên trái mình.<br>`;
        
        await monitor.take(); // simulate taking two forks
        contentBox.innerHTML += `Triết gia số ${index}: đã có đủ hai chiếc đũa và đang ăn...<br>`;
        await sleep(randomSleep());

        eatCount[index]++; // Increase the eat count
        monitor.put();
        monitor.put(); // simulate putting back two forks
        
        // Put down forks
        contentBox.innerHTML += `Triết gia số ${index}: đã thả đũa bên trái.<br>`;
        contentBox.innerHTML += `Triết gia số ${index}: đã thả đũa bên phải.<br>`;
    }
    checkAllPhilosophersDone(); // Check after each philosopher finishes eating
}

// Function to check if all philosophers are done eating
function checkAllPhilosophersDone() {
    if (eatCount.every(count => count >= 1)) { // Check if all philosophers have eaten
        contentBox.innerHTML += "Tất cả triết gia đã ăn xong!<br>";
    }
}

// Helper function to simulate random sleep time
function randomSleep() {
    return Math.random() * 1000 + 500; // 500 to 1500 milliseconds
}

// Function to sleep asynchronously
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Semaphore class definition
class Semaphore {
    constructor(value) {
        this.value = value;
        this.waitQueue = [];
    }

    acquire() {
        return new Promise((resolve) => {
            if (this.value > 0) {
                this.value--;
                resolve();
            } else {
                this.waitQueue.push(resolve);
            }
        });
    }

    release() {
        if (this.waitQueue.length > 0) {
            const resolve = this.waitQueue.shift();
            resolve();
        } else {
            this.value++;
        }
    }
}

// Monitor class definition
class Monitor {
    constructor() {
        this.mutex = new Semaphore(1);
        this.waiting = 0;
    }

    async take() {
        await this.mutex.acquire();
        this.waiting++;
        this.mutex.release();
    }

    async put() {
        await this.mutex.acquire();
        this.waiting--;
        this.mutex.release();
    }
}
