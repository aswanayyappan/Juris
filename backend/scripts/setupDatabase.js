const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Open the SQLite database (or create it if it doesn't exist)
const db = new sqlite3.Database('./court_cases.db');

// Function to create the table if it doesn't exist
const createCourtCasesTable = (callback) => {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS court_cases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            case_number TEXT,
            court_name TEXT,
            case_type TEXT,
            petitioner_name TEXT,
            petitioner_age INTEGER,
            petitioner_father_name TEXT,
            petitioner_address TEXT,
            respondent_name TEXT,
            prosecutor_name TEXT,
            crime_number TEXT,
            police_station TEXT,
            case_details TEXT,
            status TEXT,
            judgment_date TEXT,
            acquitted INTEGER,
            additional_info TEXT,
            file_name TEXT
        );
    `;
    
    db.run(createTableSQL, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('✅ court_cases table created or already exists.');
            callback();  // Run importDataFromFile only after table creation
        }
    });
};

// Function to insert data from the .txt file into the database
const importDataFromFile = (filePath) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err.message);
            return;
        }

        // Split the file content into individual INSERT statements
        const insertStatements = data.split(';');

        let statementsExecuted = 0;

        insertStatements.forEach((statement, index) => {
            const trimmedStatement = statement.trim();
            if (trimmedStatement.length > 0) {
                db.run(trimmedStatement, function(err) {
                    if (err) {
                        console.error(`❌ Error inserting statement ${index + 1}:`, err.message);
                    } else {
                        console.log(`✅ Successfully inserted statement ${index + 1}`);
                    }

                    // Close DB only after all statements are executed
                    statementsExecuted++;
                    if (statementsExecuted === insertStatements.length) {
                        db.close((err) => {
                            if (err) console.error('Error closing the database:', err.message);
                            else console.log('✅ Database connection closed.');
                        });
                    }
                });
            }
        });
    });
};

// **Step 1: Create the table first, then run the import function**
createCourtCasesTable(() => {
    importDataFromFile('./db.txt');
});
