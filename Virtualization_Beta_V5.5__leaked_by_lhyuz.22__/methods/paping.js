const ping = require('ping');

function probe(host, port, options = {}) {
  const defaults = {
    timeout: 10,
    attempts: 10
  };

  options = { ...defaults, ...options };

  const { timeout, attempts } = options;
  let attempted = 0;
  let connected = 0;
  const results = [];

  for (let i = 0; i < attempts; i++) {
    // Tạo một Promise mới để theo dõi việc kết nối
    const connectPromise = new Promise((resolve, reject) => {
      // Sử dụng hàm setTimeout để thiết lập timeout
      const timeoutId = setTimeout(() => {
        reject(new Error('Connection timed out'));
      }, timeout * 1000); // Chuyển đổi timeout từ giây sang mili giây

      ping.promise.probe(host, { port: port, timeout: timeout })
        .then((result) => {
          clearTimeout(timeoutId); // Xóa timeout nếu kết nối thành công
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId); // Xóa timeout nếu xảy ra lỗi
          reject(error);
        });
    });

    // Xử lý kết quả của Promise
    connectPromise
      .then((result) => {
        attempted++;
        if (result.alive) {
          connected++;
          results.push({
            host: host,
            port: port,
            time: result.time,
            protocol: 'TCP'
          });
        }

        if (attempted === attempts) {
          console.log(`Connecting to ${results[0].host} on TCP ${results[0].port}:\n`);

          results.forEach((result) => {
            console.log(`Connected to ${result.host}: time=${result.time.toFixed(2)}ms protocol=${result.protocol} port=${result.port}`);
          });

          console.log('\nConnection statistics:');
          console.log(`\tAttempted = ${results.length}, Connected = ${connected}, Failed = ${results.length - connected} (${((results.length - connected) / results.length * 100).toFixed(2)}%)`);

          if (results.length > 0) {
            const times = results.map(result => result.time);
            console.log(`Approximate connection times:\n\tMinimum = ${Math.min(...times).toFixed(2)}ms, Maximum = ${Math.max(...times).toFixed(2)}ms, Average = ${(times.reduce((a, b) => a + b, 0) / times.length).toFixed(2)}ms`);
          }
        }
      })
      .catch((error) => {
        attempted++;
        console.error(`${error.message}`);
      });
  }
}

const args = process.argv.slice(2);
if (args.length !== 2) {
  console.log('Invalid arguments. Usage: node paping <ip> <port>');
} else {
  const host = args[0];
  const port = parseInt(args[1]);
  probe(host, port);
}
