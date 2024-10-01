// Global variables
let philosophers = [];
let contentBox = document.getElementById('contentBox');
let numPhilosophersInput = document.getElementById('numPhilosophers');
let eatCount = []; // To track how many times each philosopher has eaten
let totalPhilosophers; // Total number of philosophers

// Event listener for the Run button
document.getElementById('runButton').addEventListener('click', function() {
    totalPhilosophers = parseInt(numPhilosophersInput.value);
    const selectedAlgorithm = document.getElementById('optionSelect').value;
    
    contentBox.innerHTML = ''; // Clear previous results

    // Reset eatCount for each run
    eatCount = Array(totalPhilosophers).fill(0); 

    if (selectedAlgorithm === "Semaphore") {
        runSemaphore(totalPhilosophers);
    } else if (selectedAlgorithm === "Monitor") {
        runMonitor(totalPhilosophers);
    }
});

// Function to run Semaphore algorithm
function runSemaphore(num) {
    const forks = Array.from({ length: num }, () => new Semaphore(1));
    philosophers = Array.from({ length: num }, (_, i) => i);
    
    // Start the philosophers
    philosophers.forEach(index => {
        philosopherSemaphore(index, forks);
    });
}

// Function to handle Semaphore logic
async function philosopherSemaphore(index, forks) {
    while (eatCount[index] < 1) { // Only eat once
        try {
            // Thinking
            contentBox.innerHTML += `Triết gia số ${index}: đang suy nghĩ...<br>`;
            await sleep(randomSleep());

            // Take Chopsticks
            const leftFork = forks[index];
            const rightFork = forks[(index + 1) % forks.length];

            await leftFork.acquire(); // Acquire left chopstick
            contentBox.innerHTML += `Triết gia số ${index}: đang giữ một chiếc đũa bên trái mình.<br>`;
            
            await rightFork.acquire(); // Acquire right chopstick
            contentBox.innerHTML += `Triết gia số ${index}: đã có đủ hai chiếc đũa và đang ăn...<br>`;

            // Eating
            await sleep(randomSleep());

            // Put Chopsticks
            leftFork.release(); // Release left chopstick
            rightFork.release(); // Release right chopstick
            contentBox.innerHTML += `Triết gia số ${index}: đã thả đũa.<br>`;
            eatCount[index]++; // Increase eat count
        } catch (e) {
            console.error(`Error with philosopher ${index}:`, e);
        }
    }
    checkAllPhilosophersDone(); // Check if all philosophers have eaten
}

// Function to run Monitor algorithm
function runMonitor(num) {
    const forks = Array.from({ length: num }, () => new Monitor());
    philosophers = Array.from({ length: num }, (_, i) => i);
    
    // Start the philosophers
    philosophers.forEach(index => {
        philosopherMonitor(index, forks);
    });
}

// Function to handle Monitor logic
async function philosopherMonitor(index, forks) {
    while (eatCount[index] < 1) { // Only eat once
        try {
            // Thinking
            contentBox.innerHTML += `Triết gia số ${index}: đang suy nghĩ...<br>`;
            await sleep(randomSleep());

            const monitor = forks[index];

            await monitor.take(); // Acquire left chopstick
            contentBox.innerHTML += `Triết gia số ${index}: đang giữ một chiếc đũa bên trái mình.<br>`;
            
            await monitor.take(); // Acquire right chopstick
            contentBox.innerHTML += `Triết gia số ${index}: đã có đủ hai chiếc đũa và đang ăn...<br>`;

            // Eating
            await sleep(randomSleep());

            // Put Chopsticks
            monitor.put(); // Release left chopstick
            contentBox.innerHTML += `Triết gia số ${index}: đã thả đũa bên trái.<br>`;
            monitor.put(); // Release right chopstick
            contentBox.innerHTML += `Triết gia số ${index}: đã thả đũa bên phải.<br>`;
            eatCount[index]++; // Increase eat count
        } catch (e) {
            console.error(`Error with philosopher ${index}:`, e);
        }
    }
    checkAllPhilosophersDone(); // Check if all philosophers have eaten
}

// Function to check if all philosophers are done eating
function checkAllPhilosophersDone() {
    if (eatCount.every(count => count >= 1)) { // Check if all philosophers have eaten at least once
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
