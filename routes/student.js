const express = require('express');
const multer = require('multer');
const Student = require('../models/Student');
const { createToken, verifyToken } = require('../utils/auth');

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Student Registration
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const student = new Student({ name, email, password });
        await student.save();
        res.status(201).json({ message: 'Student registered successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Student Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student || !(await student.comparePassword(password)))
        return res.status(400).json({ message: 'Invalid credentials' });

    const token = createToken(student);
    res.cookie('token', token, { httpOnly: true }).json({ message: 'Logged in successfully' });
});

// Get Student Profile (Authenticated)
router.get('/profile', verifyToken, async (req, res) => {
    const student = await Student.findById(req.student.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
});

// Update Student Profile (Authenticated)
router.put('/profile', verifyToken, async (req, res) => {
    const { name, email } = req.body;
    const student = await Student.findByIdAndUpdate(req.student.id, { name, email }, { new: true });
    res.json(student);
});

// File Upload (Authenticated)
router.post('/upload', verifyToken, upload.single('file'), (req, res) => {
    res.json({ message: 'File uploaded', filePath: req.file.path });
});

// Read Uploaded File (Authenticated)
router.get('/file/:filename', verifyToken, (req, res) => {
    const { filename } = req.params;
    res.sendFile(process.cwd() + `/uploads/${filename}`);
});

// Delete Uploaded File (Authenticated)
router.delete('/file/:filename', verifyToken, (req, res) => {
    const { filename } = req.params;
    const filePath = process.cwd() + `/uploads/${filename}`;
    require('fs').unlink(filePath, (err) => {
        if (err) return res.status(500).json({ message: 'File not found or unable to delete' });
        res.json({ message: 'File deleted successfully' });
    });
});

module.exports = router;
