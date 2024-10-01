let philosophers = [];
let contentBox = document.getElementById('contentBox');
let numPhilosophersInput = document.getElementById('numPhilosophers');
let eatCount = []; // Đếm số lần mỗi triết gia ăn

document.getElementById('runButton').addEventListener('click', function() {
    const numPhilosophers = parseInt(numPhilosophersInput.value);
    const selectedAlgorithm = document.getElementById('optionSelect').value;

    contentBox.innerHTML = ''; // Xóa kết quả trước đó

    eatCount = Array(numPhilosophers).fill(0); // Khởi tạo số lần ăn

    if (selectedAlgorithm === "Semaphore") {
        runSemaphore(numPhilosophers);
    } else if (selectedAlgorithm === "Monitor") {
        runMonitor(numPhilosophers);
    }
});

// Hàm chạy thuật toán Semaphore
function runSemaphore(num) {
    const forks = Array.from({ length: num }, () => new Semaphore(1));
    philosophers = Array.from({ length: num }, (_, i) => i);

    philosophers.forEach(index => {
        philosopherSemaphore(index, forks);
    });
}

// Hàm xử lý logic Semaphore
async function philosopherSemaphore(index, forks) {
    while (eatCount[index] < 1) { // Đặt số lần ăn tối đa cho mỗi triết gia
        // Suy nghĩ
        contentBox.innerHTML += `Triết gia số ${index}: đang suy nghĩ...<br>`;
        await sleep(randomSleep());

        const leftFork = forks[index];
        const rightFork = forks[(index + 1) % forks.length];

        // Cầm đũa
        contentBox.innerHTML += `Triết gia số ${index}: đang giữ một chiếc đũa bên trái mình.<br>`;
        await leftFork.acquire(); // Cầm cái nĩa bên trái

        await sleep(randomSleep()); // Thời gian tạm trước khi cầm đũa bên phải
        contentBox.innerHTML += `Triết gia số ${index}: đã có đủ hai chiếc đũa và đang ăn...<br>`;
        await rightFork.acquire(); // Cầm cái nĩa bên phải

        await sleep(randomSleep()); // Thời gian ăn
        eatCount[index]++; // Tăng số lần ăn

        // Thả đũa
        contentBox.innerHTML += `Triết gia số ${index}: đã thả đũa bên trái.<br>`;
        leftFork.release(); // Thả cái nĩa bên trái
        contentBox.innerHTML += `Triết gia số ${index}: đã thả đũa bên phải.<br>`;
        rightFork.release(); // Thả cái nĩa bên phải
    }
    checkAllPhilosophersDone(); // Kiểm tra xem tất cả triết gia đã ăn chưa
}

// Hàm chạy thuật toán Monitor
function runMonitor(num) {
    const forks = Array.from({ length: num }, () => new Monitor());
    philosophers = Array.from({ length: num }, (_, i) => i);

    philosophers.forEach(index => {
        philosopherMonitor(index, forks);
    });
}

// Hàm xử lý logic Monitor
async function philosopherMonitor(index, forks) {
    while (eatCount[index] < 1) {
        contentBox.innerHTML += `Triết gia số ${index}: đang suy nghĩ...<br>`;
        await sleep(randomSleep());

        const monitor = forks[index];

        // Cầm đũa
        contentBox.innerHTML += `Triết gia số ${index}: đang giữ một chiếc đũa bên trái mình.<br>`;
        await monitor.take(); // Cầm cái nĩa bên trái
        await monitor.take(); // Cầm cái nĩa bên phải

        // Đang ăn
        contentBox.innerHTML += `Triết gia số ${index}: đã có đủ hai chiếc đũa và đang ăn...<br>`;
        await sleep(randomSleep());

        eatCount[index]++;
        // Thả đũa
        contentBox.innerHTML += `Triết gia số ${index}: đã thả đũa bên trái.<br>`;
        await monitor.put(); // Thả cái nĩa bên trái
        contentBox.innerHTML += `Triết gia số ${index}: đã thả đũa bên phải.<br>`;
        await monitor.put(); // Thả cái nĩa bên phải
    }
    checkAllPhilosophersDone();
}

// Kiểm tra xem tất cả triết gia đã ăn xong chưa
function checkAllPhilosophersDone() {
    if (eatCount.every(count => count >= 1)) { // Kiểm tra xem tất cả đã ăn
        contentBox.innerHTML += "Tất cả triết gia đã ăn xong!<br>";
    }
}

// Hàm giúp tạo thời gian ngủ ngẫu nhiên
function randomSleep() {
    return Math.random() * 1000 + 500; // 500 đến 1500 mili giây
}

// Hàm ngủ không đồng bộ
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Định nghĩa lớp Semaphore
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

// Định nghĩa lớp Monitor
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
