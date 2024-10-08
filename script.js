// Các biến DOM
const runButton = document.getElementById('runButton');
const optionSelect = document.getElementById('optionSelect');
const problemSelect = document.getElementById('problemSelect');
const numPhilosophersInput = document.getElementById('numPhilosophers');
const contentBox = document.getElementById('contentBox');

// Biến toàn cục
let numPhilosophers = 5;
let maxEats = 1; 
let buffer = [];
let bufferLimit = 5;
let inIndex = 0;
let outIndex = 0;

// Semaphore và Monitor từ mã gốc
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

// Hiển thị kết quả
function displayResult(message) {
    contentBox.innerHTML += message + "<br>";
    contentBox.scrollTop = contentBox.scrollHeight;
}

// Hàm Producer-Consumer sử dụng Semaphore
async function producerConsumerSemaphore() {
    const semaphoreEmpty = new Semaphore(bufferLimit);
    const semaphoreFull = new Semaphore(0);
    const mutex = new Semaphore(1);

    async function producer(id) {
        while (true) {
            await semaphoreEmpty.wait(); // Chờ bộ đệm trống
            await mutex.wait();

            // Sản xuất và đưa vào buffer
            buffer[inIndex] = `Item ${inIndex}`;
            displayResult(`Producer ${id} sản xuất: ${buffer[inIndex]}`);
            inIndex = (inIndex + 1) % bufferLimit;

            mutex.signal();
            semaphoreFull.signal();
            await sleep(1000);
        }
    }

    async function consumer(id) {
        while (true) {
            await semaphoreFull.wait(); // Chờ bộ đệm đầy
            await mutex.wait();

            // Tiêu thụ từ buffer
            const item = buffer[outIndex];
            displayResult(`Consumer ${id} tiêu thụ: ${item}`);
            buffer[outIndex] = null;
            outIndex = (outIndex + 1) % bufferLimit;

            mutex.signal();
            semaphoreEmpty.signal();
            await sleep(1000);
        }
    }

    // Khởi động producers và consumers
    producer(1);
    consumer(1);
}

// Hàm Reader-Writer sử dụng Semaphore
async function readerWriterSemaphore() {
    const semaphore = new Semaphore(1);
    let readers = 0;

    async function reader(id) {
        while (true) {
            await semaphore.wait();
            readers++;
            if (readers === 1) {
                displayResult(`Reader ${id} bắt đầu đọc...`);
            }
            semaphore.signal();

            await sleep(1000); // Thời gian đọc
            displayResult(`Reader ${id} đã đọc xong.`);

            await semaphore.wait();
            readers--;
            if (readers === 0) {
                displayResult(`Reader ${id} kết thúc đọc.`);
            }
            semaphore.signal();

            await sleep(1000);
        }
    }

    async function writer(id) {
        while (true) {
            await semaphore.wait();
            displayResult(`Writer ${id} bắt đầu ghi...`);
            await sleep(1000); // Thời gian ghi
            displayResult(`Writer ${id} đã ghi xong.`);
            semaphore.signal();
            await sleep(1000);
        }
    }

    // Khởi động readers và writers
    reader(1);
    writer(1);
}

// Hàm Dining Philosophers sử dụng Semaphore
async function diningPhilosophersSemaphore() {
    const chopsticks = new Array(numPhilosophers).fill(false);
    const semaphore = new Semaphore(numPhilosophers - 1); // Chỉ có thể có n-1 triết gia ngồi cùng một lúc

    async function philosopher(id) {
        let eats = 0; // Đếm số lần ăn

        while (eats < maxEats) {
            displayResult(`Philosopher ${id} đang suy nghĩ...`);
            await sleep(1000); // Thời gian suy nghĩ

            await semaphore.wait(); // Chờ đến lượt

            // Kiểm tra xem cả hai chiếc đũa có sẵn không
            if (!chopsticks[id] && !chopsticks[(id + 1) % numPhilosophers]) {
                chopsticks[id] = true; // Lấy đũa
                chopsticks[(id + 1) % numPhilosophers] = true;
                displayResult(`Philosopher ${id} đang ăn...`);

                // Ăn
                await sleep(1000); // Thời gian ăn

                // Thả đũa
                chopsticks[id] = false;
                chopsticks[(id + 1) % numPhilosophers] = false;
                displayResult(`Philosopher ${id} đã ăn xong.`);
                eats++; // Tăng số lần ăn
            }

            semaphore.signal(); // Giải phóng semaphore
        }

        // Thông báo khi triết gia ra về
        displayResult(`Philosopher ${id} đã ăn xong ${maxEats} lần và ra về.`);
    }

    // Khởi động triết gia
    for (let i = 0; i < numPhilosophers; i++) {
        philosopher(i);
    }
}

// Sự kiện click cho nút "Run"
runButton.addEventListener('click', () => {
    contentBox.innerHTML = ""; // Xóa nội dung cũ
    numPhilosophers = parseInt(numPhilosophersInput.value);
    const selectedOption = optionSelect.value;
    const selectedProblem = problemSelect.value;

    if (selectedProblem === "DiningPhilosophers") {
        if (selectedOption === "Semaphore") {
            diningPhilosophersSemaphore();
        } else if (selectedOption === "Monitor") {
            // Chưa có hàm monitor, có thể cần bổ sung logic ở đây
            displayResult("Monitor chưa được triển khai.");
        }
    } else if (selectedProblem === "ProducerConsumer") {
        producerConsumerSemaphore();
    } else if (selectedProblem === "ReaderWriter") {
        readerWriterSemaphore();
    }
});

// Hàm sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
