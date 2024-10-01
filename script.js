// Global variables
let philosophers = [];
let contentBox = document.getElementById('contentBox');
let numPhilosophersInput = document.getElementById('numPhilosophers');

// Event listener for the Run button
document.getElementById('runButton').addEventListener('click', function() {
    const numPhilosophers = parseInt(numPhilosophersInput.value);
    const selectedAlgorithm = document.getElementById('optionSelect').value;
    
    contentBox.innerHTML = ''; // Clear previous results

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

    // Specific case for philosophers states
    const specificStates = {
        0: { state: 'holding left fork', eating: false },
        1: { state: 'eating', eating: true },
        3: { state: 'thinking', eating: false },
        4: { state: 'eating', eating: true },
        5: { state: 'thinking', eating: false },
    };

    philosophers.forEach(index => {
        if (specificStates[index]) {
            if (specificStates[index].eating) {
                philosopherSemaphore(index, forks, true);
            } else {
                philosopherSemaphore(index, forks, false);
            }
        }
    });
}

// Function to handle Semaphore logic
function philosopherSemaphore(index, forks, isEating) {
    if (!isEating) {
        contentBox.innerHTML += `Triết gia ${index} đang suy nghĩ...<br>`;
        setTimeout(() => {
            if (index === 0) {
                contentBox.innerHTML += `Triết gia ${index} lấy đũa bên trái...<br>`;
            }
            setTimeout(() => {
                if (index === 0) {
                    contentBox.innerHTML += `Triết gia ${index} không thể ăn vì thiếu đũa bên phải!<br>`;
                }
            }, randomSleep());
        }, randomSleep());
    } else {
        const leftFork = forks[index];
        const rightFork = forks[(index + 1) % forks.length];

        leftFork.acquire();
        rightFork.acquire();
        
        contentBox.innerHTML += `Triết gia ${index} đang ăn...<br>`;
        setTimeout(() => {
            contentBox.innerHTML += `Triết gia ${index} thả đũa...<br>`;
            leftFork.release();
            rightFork.release();
        }, randomSleep());
    }
}

// Function to run Monitor algorithm
function runMonitor(num) {
    const forks = Array.from({ length: num }, () => new Monitor());
    philosophers = Array.from({ length: num }, (_, i) => i);

    // Specific case for philosophers states
    const specificStates = {
        0: { state: 'holding left fork', eating: false },
        1: { state: 'eating', eating: true },
        3: { state: 'thinking', eating: false },
        4: { state: 'eating', eating: true },
        5: { state: 'thinking', eating: false },
    };

    philosophers.forEach(index => {
        if (specificStates[index]) {
            if (specificStates[index].eating) {
                philosopherMonitor(index, forks, true);
            } else {
                philosopherMonitor(index, forks, false);
            }
        }
    });
}

// Function to handle Monitor logic
function philosopherMonitor(index, forks, isEating) {
    if (!isEating) {
        contentBox.innerHTML += `Triết gia ${index} đang suy nghĩ...<br>`;
        setTimeout(() => {
            if (index === 0) {
                contentBox.innerHTML += `Triết gia ${index} lấy đũa bên trái...<br>`;
            }
            setTimeout(() => {
                if (index === 0) {
                    contentBox.innerHTML += `Triết gia ${index} không thể ăn vì thiếu đũa bên phải!<br>`;
                }
            }, randomSleep());
        }, randomSleep());
    } else {
        const monitor = forks[index];

        monitor.take();
        contentBox.innerHTML += `Triết gia ${index} đang ăn...<br>`;
        setTimeout(() => {
            contentBox.innerHTML += `Triết gia ${index} thả đũa...<br>`;
            monitor.put();
        }, randomSleep());
    }
}

// Helper function to simulate random sleep time
function randomSleep() {
    return Math.random() * 1000 + 500; // 500 to 1500 milliseconds
}

// Semaphore class definition
class Semaphore {
    constructor(value) {
        this.value = value;
        this.waitQueue = [];
    }

    acquire() {
        if (this.value > 0) {
            this.value--;
        } else {
            return new Promise(resolve => {
                this.waitQueue.push(resolve);
            });
        }
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
