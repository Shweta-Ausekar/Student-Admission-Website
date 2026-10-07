console.log("THIS IS MY SERVER.JS");
const Database = require("better-sqlite3");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
const db = new Database("admissions.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS admissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        applicationId TEXT UNIQUE,
        fullName TEXT,
        email TEXT,
        phone TEXT,
        dob TEXT,
        gender TEXT,
        address TEXT,
        course TEXT,
        previousSchool TEXT,
        percentage REAL,
        marksheet TEXT,
        submittedAt TEXT
    )
 `);

console.log("Database connected successfully");
const PORT = process.env.PORT || 3000;

// Uploads folder
const uploadFolder = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
}

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve website
app.use(express.static(__dirname));

// Serve uploaded files
app.use("/uploads", express.static(uploadFolder));

// File upload settings
const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, uploadFolder);
    },

    filename: function (req, file, cb) {

        const extension =
            path.extname(file.originalname).toLowerCase();

        const fileName =
            Date.now() + "-" +
            file.fieldname +
            extension;

        cb(null, fileName);
    }

});

const upload = multer({

    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: function (req, file, cb) {

        const allowedTypes = [
            ".pdf",
            ".jpg",
            ".jpeg",
            ".png"
        ];

        const extension =
            path.extname(file.originalname).toLowerCase();

        if (allowedTypes.includes(extension)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only PDF, JPG, JPEG and PNG files are allowed."
                )
            );
        }
    }

});

// Admission submission
app.post(
    "/submit-admission",
    upload.single("marksheet"),
    function (req, res) {

        try {

            const {
                fullName,
                email,
                phone,
                dob,
                gender,
                address,
                course,
                previousSchool,
                percentage
            } = req.body;

            // Required fields
            if (
                !fullName ||
                !email ||
                !phone ||
                !dob ||
                !gender ||
                !address ||
                !course ||
                !previousSchool ||
                !percentage
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please fill all required fields."
                });
            }

            // Marksheet required
            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    message: "Please upload your marksheet."
                });

            }

            // Create admission record
            // Save admission in database

const applicationId = "ADM-" + Date.now();

const submittedAt = new Date().toISOString();

const insertAdmission = db.prepare(`
    INSERT INTO admissions (
        applicationId,
        fullName,
        email,
        phone,
        dob,
        gender,
        address,
        course,
        previousSchool,
        percentage,
        marksheet,
        submittedAt
    )
    VALUES (
        @applicationId,
        @fullName,
        @email,
        @phone,
        @dob,
        @gender,
        @address,
        @course,
        @previousSchool,
        @percentage,
        @marksheet,
        @submittedAt
    )
`);

insertAdmission.run({
    applicationId,
    fullName,
    email,
    phone,
    dob,
    gender,
    address,
    course,
    previousSchool,
    percentage: Number(percentage),
    marksheet: req.file.filename,
    submittedAt
});
            const admission = {

                applicationId:
                    "ADM-" + Date.now(),

                fullName,
                email,
                phone,
                dob,
                gender,
                address,
                course,
                previousSchool,
                percentage,

                marksheet:
                    req.file.filename,

                submittedAt:
                    new Date().toISOString()

            };

            console.log(
                "New Admission:",
                admission
            );

            // Success response
            res.json({

                success: true,

                message:
                    "Admission submitted successfully!",

                applicationId:
                    admission.applicationId,

                student:
                    admission.fullName

            });

        }

        catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Something went wrong."

            });

        }

    }
);
// =============================
// ADMIN - GET ALL ADMISSIONS
// =============================

app.get("/api/admissions", function (req, res) {

    try {

        const admissions = db.prepare(`
            SELECT
                applicationId,
                fullName,
                email,
                phone,
                dob,
                gender,
                address,
                course,
                previousSchool,
                percentage,
                marksheet,
                submittedAt
            FROM admissions
            ORDER BY id DESC
        `).all();

        res.json({

            success: true,

            admissions: admissions

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Unable to load admissions."

        });

    }

});
// Error handler
app.use(function (error, req, res, next) {

    console.error(error);

    res.status(400).json({

        success: false,

        message:
            error.message ||
            "File upload failed."

    });

});
app.get("/test", function (req, res) {
    res.send("SERVER API WORKING");
});
// Start server
app.listen(PORT, function () {

    console.log(
        `Student Admission Server running at http://localhost:${PORT}`
    );

});
