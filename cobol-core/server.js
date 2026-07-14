const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');
const app = express();

app.use(express.json({ limit: '50mb' }));

app.post('/calculate-total', (req, res) => {
    const voucherDetails = req.body.details || [];

    if (voucherDetails.length === 0) {
        return res.json({ totalSales: 0 });
    }

    /**
     * Changing the default 15-character format to include leading zeros so that 
     * COBOL can read integer/decimal separators
     */
    const formattedLines = voucherDetails.map(voucher => {
        const amount = parseFloat(voucher.total || 0);
        const fixedAmount = amount.toFixed(2); // For example - "1500.50"
        const cleanAmount = fixedAmount.replace('.', ''); // "150050"
        return cleanAmount.padStart(15, '0'); // "000000000150050"
    });

    // Writing a temporary text file to read COBOL
    fs.writeFileSync('input_amounts.txt', formattedLines.join('\n') + '\n');

    // Running a compiled COBOL binary
    exec('./total_sales', (error, stdout, stderr) => {
        if (error) {
            console.error(`COBOL Run Error: ${error}`);
            if (stderr) console.error(`COBOL STDERR: ${stderr}`);
            return res.status(500).json({ error: 'COBOL calculation failed' });
        }

        // Converting COBOL Display Output to Float
        const totalSales = parseFloat(stdout.trim()) || 0;

        // Deleting temporary files
        try { fs.unlinkSync('input_amounts.txt'); } catch (e) {}

        // Responding with the result in JSON
        res.json({ totalSales });
    });
});

app.listen(4000, () => {
    console.log('COBOL Web Wrapper running on port 4000');
});