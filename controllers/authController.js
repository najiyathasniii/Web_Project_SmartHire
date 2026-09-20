const User = require('../models/User');
const SeekerProfile = require('../models/SeekerProfile');
const EmployerProfile = require('../models/EmployerProfile');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// --- 1. SIGNUP LOGIC ---
exports.signup = async (req, res) => {
    console.log("🚀 Incoming Signup Request:", req.body); 
    const { name, email, password, role } = req.body;

    // Frontend role values (e.g., 'Job Seeker' or 'Employer') safe aayi lowercase-ilekku convert cheyyunnu
    const formattedRole = role ? (role.toLowerCase().includes('employer') ? 'employer' : 'seeker') : 'seeker';

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("⚠️ Email already registered");
            return res.status(400).json({ message: "Email is already registered" });
        }

        console.log("🔐 Hashing password...");
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        console.log("💾 Saving to database...");
        const newUser = new User({ 
            name, 
            email, 
            password_hash, 
            role: formattedRole 
        });
        await newUser.save();

        console.log("✅ Success! Sending response to frontend.");
        res.status(201).json({ message: "Account created successfully!" });

    } catch (error) {
        console.error("❌ Backend Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// --- 2. LOGIN LOGIC ---
exports.login = async (req, res) => {
    console.log("🚀 Incoming Login Request for:", req.body.email);
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log("⚠️ User not found");
            return res.status(404).json({ message: "User not found" });
        }

        console.log("🔐 Verifying password...");
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            console.log("⚠️ Invalid password");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        let hasProfile = false;
        if (user.role === 'employer') {
            const empProfile = await EmployerProfile.findOne({ user_id: user._id });
            hasProfile = !!empProfile;
        } else if (user.role === 'seeker') {
            const seekProfile = await SeekerProfile.findOne({ user_id: user._id });
            hasProfile = !!seekProfile;
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role }, 
            process.env.JWT_SECRET || 'secretkey', 
            { expiresIn: "7d" }
        );

        console.log("✅ Login successful! Sending response.");
        res.status(200).json({ 
            message: "Login successful!",
            token: token,
            hasProfile: hasProfile,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
