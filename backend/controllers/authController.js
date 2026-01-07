const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserStats = require('../models/UserStats');

const register = async (req, res) => {
    try {
        const { username, email, password, nativeLanguage, learningLanguage, nativeLanguages, learningLanguages } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Handle Legacy vs New Inputs
        const finalNative = nativeLanguages || (nativeLanguage ? [nativeLanguage] : []);
        const finalLearning = learningLanguages || (learningLanguage ? [{ language: learningLanguage, level: 'beginner' }] : []);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            nativeLanguages: finalNative,
            learningLanguages: finalLearning
        });

        // Initialize stats
        await UserStats.create({ user: user._id });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            nativeLanguages: user.nativeLanguages,
            learningLanguages: user.learningLanguages,
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                nativeLanguages: user.nativeLanguages,
                learningLanguages: user.learningLanguages,
                token
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getProfile = async (req, res) => {
    // Middleware should attach user to req
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
}

const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.username = req.body.username || user.username;
            // email updates usually require verification, skipping for now
            if (req.body.nativeLanguages) user.nativeLanguages = req.body.nativeLanguages;
            if (req.body.learningLanguages) user.learningLanguages = req.body.learningLanguages;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                nativeLanguages: updatedUser.nativeLanguages,
                learningLanguages: updatedUser.learningLanguages,
                token: req.headers.authorization?.split(' ')[1]
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { register, login, getProfile, updateProfile };
