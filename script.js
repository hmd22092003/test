class Semaphore {
  constructor(count) {
      this.count = count;
      this.queue = [];
  }

  acquire() {
      return new Promise((resolve) => {
          const tryAcquire = () => {
              if (this.count > 0) {
                  this.count--;
                  resolve();
              } else {
                  this.queue.push(tryAcquire);
              }
          };
          tryAcquire();
      });
  }

  release() {
      this.count++;
      if (this.queue.length > 0) {
          const next = this.queue.shift();
          next();
      }
  }
}

class Philosopher {
  constructor(name, leftFork, rightFork) {
      this.name = name;
      this.leftFork = leftFork;
      this.rightFork = rightFork;
  }

  async eat() {
      await this.leftFork.acquire();
      await this.rightFork.acquire();

      const resultBox = document.getElementById('resultBox');
      resultBox.innerHTML += `<p>${this.name} is eating...</p>`;
      await this.sleep(1000); // Simulate eating time

      this.rightFork.release();
      this.leftFork.release();

      resultBox.innerHTML += `<p>${this.name} has finished eating.</p>`;
  }

  sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

const forkCount = 5;
const forks = Array.from({ length: forkCount }, () => new Semaphore(1));
const philosophers = Array.from({ length: forkCount }, (_, i) => {
  const leftFork = forks[i];
  const rightFork = forks[(i + 1) % forkCount];
  return new Philosopher(`Philosopher ${i + 1}`, leftFork, rightFork);
});

async function dine() {
  const resultBox = document.getElementById('resultBox');
  resultBox.innerHTML = ''; // Clear previous results
  const dinePromises = philosophers.map(philosopher => philosopher.eat());
  await Promise.all(dinePromises);
}

document.getElementById('runButton').addEventListener('click', () => {
  dine();
});
