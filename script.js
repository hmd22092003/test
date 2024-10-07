// Chọn các phần tử DOM
const runButton = document.getElementById('runButton');
const optionSelect = document.getElementById('optionSelect');
const numPhilosophersInput = document.getElementById('numPhilosophers');
const contentBox = document.getElementById('contentBox');

// Khai báo các biến toàn cục
let philosophers = [];
let numPhilosophers = 5; // Giá trị mặc định
let maxEats = 1; // Giới hạn số lần ăn tối đa cho mỗi triết gia

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

// Hàm cho Semaphore
async function semaphore() {
    const chopsticks = new Array(numPhilosophers).fill(false);
    const semaphore = new Semaphore(numPhilosophers - 1); // Chỉ có thể có n-1 triết gia ngồi cùng một lúc

    async function philosopher(id) {
        let eats = 0; // Đếm số lần ăn

        while (eats < maxEats) {
            // Suy nghĩ
            displayResult(`Triết gia số ${id}: đang suy nghĩ...`);
            await sleep(1000); // Thời gian suy nghĩ

            await semaphore.wait(); // Chờ đến lượt

            // Kiểm tra xem cả hai chiếc đũa có sẵn không
            if (!chopsticks[id] && !chopsticks[(id + 1) % numPhilosophers]) {
                // Lấy đũa
                chopsticks[id] = true;
                chopsticks[(id + 1) % numPhilosophers] = true;
                displayResult(`Triết gia số ${id}: đã có đủ hai chiếc đũa và đang ăn...`);

                // Ăn
                await sleep(1000); // Thời gian ăn

                // Thả đũa
                chopsticks[id] = false;
                chopsticks[(id + 1) % numPhilosophers] = false;
                displayResult(`Triết gia số ${id}: đã ăn xong và thả đũa...`);
                eats++; // Tăng số lần ăn
            }

            semaphore.signal(); // Giải phóng semaphore
        }

        displayResult(`Triết gia số ${id}: đã ăn xong ${maxEats} lần và ra về.`);
    }

    // Khởi động triết gia
    for (let i = 0; i < numPhilosophers; i++) {
        philosophers[i] = philosopher(i);
    }
}

// Hàm cho Monitor
async function monitor() {
    const chopsticks = new Array(numPhilosophers).fill(false);
    const monitor = new Monitor();

    async function philosopher(id) {
        let eats = 0; // Đếm số lần ăn

        while (eats < maxEats) {
            // Suy nghĩ
            displayResult(`Triết gia số ${id}: đang suy nghĩ...`);
            await sleep(1000); // Thời gian suy nghĩ

            await monitor.enter();
            // Kiểm tra xem cả hai chiếc đũa có sẵn không
            if (!chopsticks[id] && !chopsticks[(id + 1) % numPhilosophers]) {
                // Lấy đũa
                chopsticks[id] = true;
                chopsticks[(id + 1) % numPhilosophers] = true;
                displayResult(`Triết gia số ${id}: đã có đủ hai chiếc đũa và đang ăn...`);

                // Ăn
                await sleep(1000); // Thời gian ăn

                // Thả đũa
                chopsticks[id] = false;
                chopsticks[(id + 1) % numPhilosophers] = false;
                displayResult(`Triết gia số ${id}: đã ăn xong và thả đũa...`);
                eats++; // Tăng số lần ăn
            }
            monitor.leave(); // Giải phóng monitor
        }

        displayResult(`Triết gia số ${id}: đã ăn xong ${maxEats} lần và ra về.`);
    }

    // Khởi động triết gia
    for (let i = 0; i < numPhilosophers; i++) {
        philosophers[i] = philosopher(i);
    }
}

// Sự kiện click cho nút "Run"
runButton.addEventListener('click', () => {
    contentBox.innerHTML = ""; // Xóa nội dung cũ
    numPhilosophers = parseInt(numPhilosophersInput.value);
    const selectedOption = optionSelect.value;

    if (selectedOption === "Semaphore") {
        semaphore();
    } else if (selectedOption === "Monitor") {
        monitor();
    }
});
