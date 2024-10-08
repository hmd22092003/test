// Chọn các phần tử DOM
const runButton = document.getElementById('runButton');
const optionSelect = document.getElementById('optionSelect');
const numPhilosophersInput = document.getElementById('numPhilosophers');
const contentBox = document.getElementById('contentBox');

// Khai báo các biến toàn cục
let philosophers = [];
let numPhilosophers = 5; // Giá trị mặc định
let maxEats = 1; // Giới hạn số lần ăn tối đa cho mỗi triết gia
let maxItems = 10; // Giới hạn số sản phẩm tối đa cho Producer-Consumer

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

// Hàm cho Semaphore (Triết gia)
async function semaphorePhilosophers() {
    const chopsticks = new Array(numPhilosophers).fill(false);
    const semaphore = new Semaphore(numPhilosophers - 1); // Chỉ có thể có n-1 triết gia ngồi cùng một lúc

    async function philosopher(id) {
        let eats = 0; // Đếm số lần ăn

        while (eats < maxEats) {
            displayResult(`Triết gia số ${id}: đang suy nghĩ...`);
            await sleep(1000); // Thời gian suy nghĩ

            await semaphore.wait(); // Chờ đến lượt

            if (!chopsticks[id] && !chopsticks[(id + 1) % numPhilosophers]) {
                chopsticks[id] = true;
                chopsticks[(id + 1) % numPhilosophers] = true;
                displayResult(`Triết gia số ${id}: đã có đủ hai chiếc đũa và đang ăn...`);
                await sleep(1000); // Thời gian ăn
                chopsticks[id] = false;
                chopsticks[(id + 1) % numPhilosophers] = false;
                displayResult(`Triết gia số ${id}: đã ăn xong và thả đũa...`);
                eats++; // Tăng số lần ăn
            }

            semaphore.signal(); // Giải phóng semaphore
        }

        displayResult(`Triết gia số ${id}: đã ăn xong ${maxEats} lần và ra về.`);
    }

    for (let i = 0; i < numPhilosophers; i++) {
        philosophers[i] = philosopher(i);
    }
}

// Hàm cho Monitor (Triết gia)
async function monitorPhilosophers() {
    const chopsticks = new Array(numPhilosophers).fill(false);
    const monitor = new Monitor();

    async function philosopher(id) {
        let eats = 0; // Đếm số lần ăn

        while (eats < maxEats) {
            displayResult(`Triết gia số ${id}: đang suy nghĩ...`);
            await sleep(1000); // Thời gian suy nghĩ

            await monitor.enter(); // Nhập vào monitor

            if (!chopsticks[id] && !chopsticks[(id + 1) % numPhilosophers]) {
                chopsticks[id] = true;
                chopsticks[(id + 1) % numPhilosophers] = true;
                displayResult(`Triết gia số ${id}: đã có đủ hai chiếc đũa và đang ăn...`);
                await sleep(1000); // Thời gian ăn
                chopsticks[id] = false;
                chopsticks[(id + 1) % numPhilosophers] = false;
                displayResult(`Triết gia số ${id}: đã ăn xong và thả đũa...`);
                eats++; // Tăng số lần ăn
            }

            monitor.leave(); // Giải phóng monitor
        }

        displayResult(`Triết gia số ${id}: đã ăn xong ${maxEats} lần và ra về.`);
    }

    for (let i = 0; i < numPhilosophers; i++) {
        philosophers[i] = philosopher(i);
    }
}

// Hàm cho Semaphore (Producer-Consumer)
async function semaphoreProducerConsumer() {
    const buffer = [];
    const bufferSize = 5; // Kích thước của buffer
    const semaphoreEmpty = new Semaphore(bufferSize); // Chờ có chỗ trống
    const semaphoreFull = new Semaphore(0); // Chờ có sản phẩm
    let totalProduced = 0; // Biến đếm tổng sản phẩm đã sản xuất

    async function producer(id) {
        while (totalProduced < maxItems) { // Điều kiện dừng sản xuất
            const item = `Sản phẩm ${totalProduced}`; // Tạo sản phẩm
            await semaphoreEmpty.wait(); // Chờ có chỗ trống trong buffer
            buffer.push(item); // Thêm sản phẩm vào buffer
            displayResult(`Producer ${id}: đã thêm ${item} vào buffer`);
            semaphoreFull.signal(); // Tín hiệu cho consumer
            totalProduced++; // Tăng số sản phẩm đã sản xuất
            await sleep(1000); // Giả lập thời gian sản xuất
        }
    }

    async function consumer(id) {
        while (totalProduced > 0 || semaphoreFull.count > 0) { // Điều kiện dừng tiêu thụ
            await semaphoreFull.wait(); // Chờ có sản phẩm trong buffer
            const item = buffer.shift(); // Lấy sản phẩm từ buffer
            displayResult(`Consumer ${id}: đã tiêu thụ ${item} từ buffer`);
            semaphoreEmpty.signal(); // Tín hiệu cho producer
            await sleep(1500); // Giả lập thời gian tiêu thụ
        }
    }

    for (let i = 0; i < 2; i++) {
        producer(i);
        consumer(i);
    }
}

// Hàm cho Monitor (Producer-Consumer)
async function monitorProducerConsumer() {
    const buffer = [];
    const bufferSize = 5; // Kích thước của buffer
    const monitorLock = new Monitor();
    let totalProduced = 0; // Biến đếm tổng sản phẩm đã sản xuất

    async function producer(id) {
        while (totalProduced < maxItems) { // Điều kiện dừng sản xuất
            const item = `Sản phẩm ${totalProduced}`; // Tạo sản phẩm
            await monitorLock.enter(); // Nhập vào monitor
            if (buffer.length < bufferSize) {
                buffer.push(item); // Thêm sản phẩm vào buffer
                displayResult(`Producer ${id}: đã thêm ${item} vào buffer`);
                totalProduced++; // Tăng số sản phẩm đã sản xuất
            }
            monitorLock.leave(); // Rời khỏi monitor
            await sleep(1000); // Giả lập thời gian sản xuất
        }
    }

    async function consumer(id) {
        while (totalProduced > 0) { // Điều kiện dừng tiêu thụ
            await monitorLock.enter(); // Nhập vào monitor
            if (buffer.length > 0) {
                const item = buffer.shift(); // Lấy sản phẩm từ buffer
                displayResult(`Consumer ${id}: đã tiêu thụ ${item} từ buffer`);
            }
            monitorLock.leave(); // Rời khỏi monitor
            await sleep(1500); // Giả lập thời gian tiêu thụ
        }
    }

    for (let i = 0; i < 2; i++) {
        producer(i);
        consumer(i);
    }
}

// Sự kiện khi nhấn nút chạy
runButton.addEventListener('click', async () => {
    contentBox.innerHTML = ""; // Xóa nội dung trước khi chạy
    numPhilosophers = parseInt(numPhilosophersInput.value); // Lấy số triết gia

    const selectedOption = optionSelect.value;
    switch (selectedOption) {
        case 'Philosophers - Semaphore':
            await semaphorePhilosophers();
            break;
        case 'Philosophers - Monitor':
            await monitorPhilosophers();
            break;
        case 'Producer - Semaphore':
            await semaphoreProducerConsumer();
            break;
        case 'Producer - Monitor':
            await monitorProducerConsumer();
            break;
        default:
            displayResult('Chưa chọn phương pháp nào.');
            break;
    }
});
