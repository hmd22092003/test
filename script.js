class DiningPhilosophers {
    constructor(numPhilosophers) {
        this.numPhilosophers = numPhilosophers;  // Số lượng triết gia
        this.states = new Array(numPhilosophers).fill('THINKING');  // Trạng thái của triết gia
        this.self = new Array(numPhilosophers).fill(null).map(() => new Condition());  // Điều kiện của mỗi triết gia
    }

    // Hàm lấy đũa (pickup)
    async pickup(i) {
        this.states[i] = 'HUNGRY';
        this.test(i);
        if (this.states[i] !== 'EATING') {
            await this.self[i].wait();  // Chờ nếu không thể ăn
        }
    }

    // Hàm bỏ đũa (putdown)
    putdown(i) {
        this.states[i] = 'THINKING';
        this.test((i + this.numPhilosophers - 1) % this.numPhilosophers);  // Kiểm tra triết gia bên trái
        this.test((i + 1) % this.numPhilosophers);  // Kiểm tra triết gia bên phải
    }

    // Hàm kiểm tra trạng thái (test)
    test(i) {
        if (this.states[(i + this.numPhilosophers - 1) % this.numPhilosophers] !== 'EATING' && 
            this.states[i] === 'HUNGRY' && 
            this.states[(i + 1) % this.numPhilosophers] !== 'EATING') {
            this.states[i] = 'EATING';
            this.self[i].signal();  // Cho phép triết gia ăn
            contentBox.innerHTML += `Triết gia số ${i}: đã có đủ hai chiếc đũa và đang ăn...<br>`; // In ra kết quả
        }
    }

    // Khởi tạo trạng thái của tất cả triết gia
    initialize() {
        for (let i = 0; i < this.numPhilosophers; i++) {
            this.states[i] = 'THINKING';  // Tất cả triết gia bắt đầu trong trạng thái "THINKING"
        }
    }
}

// Lớp mô phỏng điều kiện (Condition)
class Condition {
    constructor() {
        this.queue = [];  // Hàng đợi cho triết gia chờ
    }

    wait() {
        return new Promise((resolve) => {
            this.queue.push(resolve);  // Đẩy hàm resolve vào hàng đợi
        });
    }

    signal() {
        if (this.queue.length > 0) {
            const resolve = this.queue.shift();  // Lấy hàm resolve đầu tiên trong hàng đợi
            resolve();  // Gọi hàm resolve để cho phép triết gia tiếp tục
        }
    }
}

// Hàm mô phỏng triết gia ăn
async function simulateDiningPhilosophers() {
    const numPhilosophers = parseInt(document.getElementById('numPhilosophers').value);  // Lấy số lượng triết gia từ input
    const dp = new DiningPhilosophers(numPhilosophers);  // Tạo đối tượng DiningPhilosophers
    dp.initialize();  // Khởi tạo trạng thái cho tất cả triết gia

    for (let i = 0; i < numPhilosophers; i++) {
        await dp.pickup(i);  // Triết gia lấy đũa
        contentBox.innerHTML += `Triết gia số ${i}: đang ăn...<br>`;  // In ra kết quả khi triết gia bắt đầu ăn
        await sleep(randomSleep());  // Giả lập thời gian ăn
        dp.putdown(i);  // Triết gia thả đũa
        contentBox.innerHTML += `Triết gia số ${i}: đã thả đũa.<br>`;  // In ra kết quả khi triết gia thả đũa
    }

    contentBox.innerHTML += "Tất cả triết gia đã ăn xong!<br>";  // In ra thông báo khi tất cả đã ăn xong
}

// Hàm ngủ không đồng bộ
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Hàm tạo thời gian ngủ ngẫu nhiên
function randomSleep() {
    return Math.random() * 1000 + 500;  // 500 đến 1500 mili giây
}

// Lắng nghe sự kiện click trên nút "Run"
document.getElementById('runButton').addEventListener('click', () => {
    contentBox.innerHTML = '';  // Xóa kết quả trước đó
    simulateDiningPhilosophers();  // Bắt đầu mô phỏng
});
