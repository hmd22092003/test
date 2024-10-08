// Chọn các phần tử DOM
const runButton = document.getElementById('runButton');
const problemSelect = document.getElementById('problemSelect');
const algorithmSelect = document.getElementById('algorithmSelect');
const numPhilosophersInput = document.getElementById('numPhilosophers');
const contentBox = document.getElementById('contentBox');

// Khai báo các biến toàn cục
let numPhilosophers = 5; // Giá trị mặc định
let maxEats = 1; // Giới hạn số lần ăn tối đa cho mỗi triết gia
let maxProduceConsume = 5; // Giới hạn số lần sản xuất tiêu thụ cho Producer-Consumer

// Hàm để hiển thị kết quả
function displayResult(message) {
    contentBox.innerHTML += message + "<br>";
    contentBox.scrollTop = contentBox.scrollHeight; // Cuộn xuống cùng
}

// Hàm tạm dừng (sleep)
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Khai báo Semaphore
class Semaphore {
    constructor(count) {
        this.count = count;
        this.queue = [];
    }

    async wait() {
        if (this.count <= 0) {
            await new Promise(resolve => this.queue.push(resolve));
        }
        this.count--;
    }

    signal() {
        this.count++;
        if (this.queue.length > 0) {
            const resolve = this.queue.shift();
            resolve();
        }
    }
}

// Khai báo Monitor
class Monitor {
    constructor() {
        this.lock = false;
        this.queue = [];
    }

    async enter() {
        while (this.lock) {
            await new Promise(resolve => this.queue.push(resolve));
        }
        this.lock = true;
    }

    leave() {
        this.lock = false;
        if (this.queue.length > 0) {
            const resolve = this.queue.shift();
            resolve();
        }
    }
}

// ==================== COMMON FUNCTION FOR SEMAPHORE AND MONITOR ====================

// Common function for running simulation
async function runSimulation(type, approach, actions) {
    const resources = {
        chopsticks: new Array(numPhilosophers).fill(false), // for Philosopher problem
        buffer: [], // for Producer-Consumer problem
        maxBufferSize: 5, // buffer size for Producer-Consumer
        readerCount: 0 // for Readers-Writers problem
    };

    // Create instances of Semaphore or Monitor based on the selected approach
    const mutex = approach === "Semaphore" ? new Semaphore(1) : new Monitor();
    const rwLock = approach === "Semaphore" ? new Semaphore(1) : null;
    const empty = new Semaphore(resources.maxBufferSize);
    const full = new Semaphore(0);

    async function actionHandler(id) {
        if (type === 'philosopher') {
            await actions.philosopher(id, resources, mutex);
        } else if (type === 'rw') {
            await actions.rw(id, resources, mutex, rwLock);
        } else if (type === 'pc') {
            await actions.pc(id, resources, mutex, empty, full);
        }
    }

    // Launch 5 entities for the simulation (philosophers, readers/writers, producers/consumers)
    for (let i = 0; i < 5; i++) {
        actionHandler(i);
    }
}

// ==================== ACTIONS FOR EACH PROBLEM ====================

// Actions for Philosopher problem
const philosopherActions = {
    philosopher: async (id, resources, syncObject) => {
        const { chopsticks } = resources;
        let eats = 0;

        while (eats < maxEats) {
            displayResult(`Triết gia số ${id}: đang suy nghĩ...`);
            await sleep(1000);

            await syncObject.enter(); // Monitor enter

            // Lấy đũa nếu cả hai chiếc đũa đều sẵn sàng
            if (!chopsticks[id] && !chopsticks[(id + 1) % numPhilosophers]) {
                chopsticks[id] = chopsticks[(id + 1) % numPhilosophers] = true;
                displayResult(`Triết gia số ${id}: đang ăn...`);
                await sleep(1000);

                chopsticks[id] = chopsticks[(id + 1) % numPhilosophers] = false;
                displayResult(`Triết gia số ${id}: đã ăn xong.`);
                eats++;
            }

            syncObject.leave(); // Monitor leave
        }
        displayResult(`Triết gia số ${id}: hoàn thành.`);
    }
};

// Actions for Readers-Writers problem
const rwActions = {
    rw: async (id, resources, mutex, rwLock) => {
        const { readerCount } = resources;
        const isReader = id % 2 === 0;

        if (isReader) {
            await mutex.enter();
            resources.readerCount++;
            if (resources.readerCount === 1 && rwLock) await rwLock.wait(); // Semaphore case
            mutex.leave();

            displayResult(`Reader ${id}: đang đọc...`);
            await sleep(1000);

            await mutex.enter();
            resources.readerCount--;
            if (resources.readerCount === 0 && rwLock) rwLock.signal(); // Semaphore case
            mutex.leave();

            displayResult(`Reader ${id}: hoàn thành.`);
        } else {
            await rwLock.wait();
            displayResult(`Writer ${id}: đang viết...`);
            await sleep(1000);
            rwLock.signal();
            displayResult(`Writer ${id}: hoàn thành.`);
        }
    }
};

// Actions for Producer-Consumer problem
const pcActions = {
    pc: async (id, resources, mutex, empty, full) => {
        const isProducer = id % 2 === 0;
        const { buffer, maxBufferSize } = resources;
        let produceConsumeCount = 0;

        if (isProducer) {
            while (produceConsumeCount < maxProduceConsume) {
                await empty.wait(); // Wait until there’s space in buffer
                await mutex.enter();

                if (buffer.length < maxBufferSize) {
                    buffer.push(`Item by producer ${id}`);
                    displayResult(`Producer ${id} đã sản xuất.`);
                    produceConsumeCount++;
                }

                mutex.leave();
                full.signal(); // Signal that buffer has items
                await sleep(1000);
            }
        } else {
            while (produceConsumeCount < maxProduceConsume) {
                await full.wait(); // Wait until buffer has items
                await mutex.enter();

                if (buffer.length > 0) {
                    buffer.pop();
                    displayResult(`Consumer ${id} đã tiêu thụ.`);
                    produceConsumeCount++;
                }

                mutex.leave();
                empty.signal(); // Signal that buffer has space
                await sleep(1000);
            }
        }
    }
};

// ==================== EVENT LISTENERS FOR BUTTONS ====================

runButton.addEventListener('click', () => {
    contentBox.innerHTML = ""; // Clear previous content
    numPhilosophers = parseInt(numPhilosophersInput.value);
    const selectedProblem = problemSelect.value;
    const selectedAlgorithm = algorithmSelect.value;
    runSimulation(selectedProblem, selectedAlgorithm, selectedProblem === 'philosopher' ? philosopherActions : selectedProblem === 'rw' ? rwActions : pcActions);
});
