// Chọn các phần tử DOM
const runPhilosopherButton = document.getElementById('runPhilosopher');
const runRWButton = document.getElementById('runRW');
const runPCButton = document.getElementById('runPC');
const philosopherSelect = document.getElementById('philosopherSelect');
const rwSelect = document.getElementById('rwSelect');
const pcSelect = document.getElementById('pcSelect');
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

// ================= Triết Gia (Philosopher) Problem =================

// Hàm cho Semaphore (Triết Gia)
async function semaphorePhilosophers() {
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

        // Thông báo khi triết gia ra về
        displayResult(`Triết gia số ${id}: đã ăn xong ${maxEats} lần và ra về.`);
    }

    // Khởi động triết gia
    for (let i = 0; i < numPhilosophers; i++) {
        philosophers[i] = philosopher(i);
    }
}

// Hàm cho Monitor (Triết Gia)
async function monitorPhilosophers() {
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

        // Thông báo khi triết gia ra về
        displayResult(`Triết gia số ${id}: đã ăn xong ${maxEats} lần và ra về.`);
    }

    // Khởi động triết gia
    for (let i = 0; i < numPhilosophers; i++) {
        philosophers[i] = philosopher(i);
    }
}

// ================= Readers-Writers Problem =================

// Semaphore-based Readers-Writers
async function semaphoreRW() {
    let readerCount = 0;
    const mutex = new Semaphore(1);
    const rwLock = new Semaphore(1);

    async function reader(id) {
        await mutex.wait();
        readerCount++;
        if (readerCount === 1) {
            await rwLock.wait();
        }
        mutex.signal();

        displayResult(`Reader ${id} is reading...`);
        await sleep(1000); // Reading time
        displayResult(`Reader ${id} finished reading`);

        await mutex.wait();
        readerCount--;
        if (readerCount === 0) {
            rwLock.signal();
        }
        mutex.signal();
    }

    async function writer(id) {
        await rwLock.wait();
        displayResult(`Writer ${id} is writing...`);
        await sleep(1000); // Writing time
        displayResult(`Writer ${id} finished writing`);
        rwLock.signal();
    }

    // Launch some readers and writers
    for (let i = 0; i < 3; i++) {
        reader(i);
        writer(i);
    }
}

// Monitor-based Readers-Writers
async function monitorRW() {
    let readerCount = 0;
    const monitor = new Monitor();

    async function reader(id) {
        await monitor.enter();
        readerCount++;
        if (readerCount === 1) {
            await monitor.enter();
        }
        monitor.leave();

        displayResult(`Reader ${id} is reading...`);
        await sleep(1000); // Reading time
        displayResult(`Reader ${id} finished reading`);

        await monitor.enter();
        readerCount--;
        if (readerCount === 0) {
            monitor.leave();
        }
        monitor.leave();
    }

    async function writer(id) {
        await monitor.enter();
        displayResult(`Writer ${id} is writing...`);
        await sleep(1000); // Writing time
        displayResult(`Writer ${id} finished writing`);
        monitor.leave();
    }

    // Launch some readers and writers
    for (let i = 0; i < 3; i++) {
        reader(i);
        writer(i);
    }
}

// ================= Producer-Consumer Problem =================

// Semaphore-based Producer-Consumer
async function semaphorePC() {
    const buffer = [];
    const maxBufferSize = 5;
    const mutex = new Semaphore(1);
    const empty = new Semaphore(maxBufferSize);
    const full = new Semaphore(0);

    async function producer(id) {
        while (true) {
            await empty.wait();
            await mutex.wait();
            if (buffer.length < maxBufferSize) {
                buffer.push(`Item by producer ${id}`);
                displayResult(`Producer ${id} produced an item.`);
            }
            mutex.signal();
            full.signal();
            await sleep(1000); // Producing time
        }
    }

    async function consumer(id) {
        while (true) {
            await full.wait();
            await mutex.wait();
            if (buffer.length > 0) {
                buffer.pop();
                displayResult(`Consumer ${id} consumed an item.`);
            }
            mutex.signal();
            empty.signal();
            await sleep(1000); // Consuming time
        }
    }

    // Launch some producers and consumers
    producer(1);
    consumer(1);
}

// Monitor-based Producer-Consumer
async function monitorPC() {
    const buffer = [];
    const maxBufferSize = 5;
    const monitor = new Monitor();

    async function producer(id) {
        while (true) {
            await monitor.enter();
            if (buffer.length < maxBufferSize) {
                buffer.push(`Item by producer ${id}`);
                displayResult(`Producer ${id} produced an item.`);
            }
            monitor.leave();
            await sleep(1000); // Producing time
        }
    }

    async function consumer(id) {
        while (true) {
            await monitor.enter();
            if (buffer.length > 0) {
                buffer.pop();
                displayResult(`Consumer ${id} consumed an item.`);
            }
            monitor.leave();
            await sleep(1000); // Consuming time
        }
    }

    // Launch some producers and consumers
    producer(1);
    consumer(1);
}

// Sự kiện click cho nút "Run" (Philosopher)
runPhilosopherButton.addEventListener('click', () => {
    contentBox.innerHTML = ""; // Xóa nội dung cũ
    numPhilosophers = parseInt(numPhilosophersInput.value);
    const selectedOption = philosopherSelect.value;

    if (selectedOption === "Semaphore") {
        semaphorePhilosophers();
    } else if (selectedOption === "Monitor") {
        monitorPhilosophers();
    }
});

// Sự kiện click cho nút "Run" (Readers-Writers)
runRWButton.addEventListener('click', () => {
    contentBox.innerHTML = ""; // Xóa nội dung cũ
    const selectedOption = rwSelect.value;

    if (selectedOption === "Semaphore") {
        semaphoreRW();
    } else if (selectedOption === "Monitor") {
        monitorRW();
    }
});

// Sự kiện click cho nút "Run" (Producer-Consumer)
runPCButton.addEventListener('click', () => {
    contentBox.innerHTML = ""; // Xóa nội dung cũ
    const selectedOption = pcSelect.value;

    if (selectedOption === "Semaphore") {
        semaphorePC();
    } else if (selectedOption === "Monitor") {
        monitorPC();
    }
});
