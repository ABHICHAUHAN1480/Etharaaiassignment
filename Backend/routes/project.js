const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/create', authMiddleware, async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const { name, description } = req.body;
        const createdBy = req.user.id;
        const members = req.body.members || [];
        const status = req.body.status || 'active';
        if (!name || !description) {
            return res.status(400).json({ error: 'Name and description are required' });
        }
        const project = await Project.create({ name, description, createdBy, members, status });
        res.status(201).json({ message: 'Project created successfully', project });
    } catch (error) {
        next(error);
    }
});
router.get('/all', authMiddleware, async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const projects = await Project.find().populate('createdBy', 'name email').populate('members', 'name email');
        res.json({ projects });
    } catch (error) {
        next(error);
    }
});

router.delete('/:projectId', authMiddleware, async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const { projectId } = req.params;
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }   
        await Project.findByIdAndDelete(projectId);
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        next(error);
    }
});

router.get('/myprojects', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const projects = await Project.find({
            $or: [
                { createdBy: userId },
                { members: userId }
            ]
        });
        res.json({ projects });
    } catch (error) {
        next(error);
    }
});

router.put('/:projectId/:memberId', authMiddleware, async (req, res, next) => {
    try {
        console.log(req.user);
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const { projectId, memberId } = req.params;
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        const memberIndex = project.members.indexOf(memberId);
        if (memberIndex === -1) {
            project.members.push(memberId);
        } else {
            project.members.splice(memberIndex, 1);
        }
        const updatedProject = await Project.findByIdAndUpdate(projectId, { members: project.members }, { new: true });
        res.json({ message: 'Project updated successfully', project: updatedProject });
    } catch (error) {
        next(error);
    }
});
router.delete('/:projectId/:memberId', authMiddleware, async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const { projectId, memberId } = req.params;
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }   
        const memberIndex = project.members.indexOf(memberId);
        if (memberIndex === -1) {
            return res.status(404).json({ error: 'Member not found in project' });
        }
        project.members.splice(memberIndex, 1);
        const updatedProject = await Project.findByIdAndUpdate(projectId, { members: project.members }, { new: true });
        res.json({ message: 'Member removed from project successfully', project: updatedProject });
    } catch (error) {
        next(error);
    }
});
router.put('/:projectId/status', authMiddleware, async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const { projectId } = req.params;
        const { status } = req.body;
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        project.status = status;
        const updatedProject = await project.save();
        res.json({ message: 'Project status updated successfully', project: updatedProject });
    } catch (error) {
        next(error);
    }
});

module.exports = router;