const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Tasks');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/create', authMiddleware, async (req, res, next) => {
    try {
        const { title, description, projectId, assignedTo, dueDate } = req.body; 
        const assignedBy = req.user.id;
        if (!title || !projectId || !assignedTo) {
            return res.status(400).json({ error: 'Title, projectId and assignedTo are required' });
        }
        const task = await Task.create({ title, description, projectId, assignedTo, assignedBy, dueDate });
        res.status(201).json({ message: 'Task created successfully', task });
    }
    catch (error) {
        next(error);
    }
});

router.get('/project/:projectId', authMiddleware, async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const tasks = await Task.find({ projectId }).populate('assignedTo', 'name email').populate('assignedBy', 'name email');
        res.json({ tasks });
    }
    catch (error) {
        next(error);
    }
});

router.get('/mine', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const tasks = await Task.find({ assignedTo: userId }).populate('projectId', 'name').populate('assignedBy', 'name email');
        res.json({ tasks });
    }
    catch (error) {
        next(error);
    }
});

router.put('/:taskId/status', authMiddleware, async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        if (task.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({ error: 'You can only update status of tasks assigned to you' });
        }
        task.status = status;
        await task.save();
        res.json({ message: 'Task status updated successfully', task });
    }
    catch (error) {
        next(error);
    }
});


module.exports = router;