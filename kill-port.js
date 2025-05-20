const { exec } = require('child_process');

const PORT = 3002;

// Tìm PID của tiến trình đang sử dụng cổng 3002
exec(`netstat -ano | findstr :${PORT}`, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error executing command: ${error.message}`);
        return;
    }

    if (stderr) {
        console.error(`Command stderr: ${stderr}`);
        return;
    }

    console.log(`Processes using port ${PORT}:`);
    console.log(stdout);

    // Lấy PID từ kết quả
    const lines = stdout.trim().split('\n');
    if (lines.length > 0) {
        const pidMatches = lines.map(line => {
            const parts = line.trim().split(/\s+/);
            return parts[parts.length - 1];
        });

        const uniquePids = [...new Set(pidMatches)];

        console.log(`Found PIDs: ${uniquePids.join(', ')}`);

        // Dừng các tiến trình
        uniquePids.forEach(pid => {
            console.log(`Attempting to kill process with PID: ${pid}`);
            exec(`taskkill /F /PID ${pid}`, (killError, killStdout, killStderr) => {
                if (killError) {
                    console.error(`Error killing process: ${killError.message}`);
                    return;
                }

                console.log(`Process killed: ${killStdout}`);
            });
        });
    } else {
        console.log(`No process found using port ${PORT}`);
    }
});