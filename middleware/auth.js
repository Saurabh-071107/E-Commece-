import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "#%$*$%^@%*#&";

export const auth = (req, res, next) => {
    try {
        const header = req.headers.authorization || req.headers.token;
        if (!header) {
            return res.status(401).json({ message: "Access denied. JWT token is required" });
        }
        const token = header.startsWith("Bearer ") ? header.split(" ")[1] : header;
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.role = decoded.role || "user";
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired JWT token" });
    }
};

export const adminAuth = (req, res, next) => {
    auth(req, res, () => {
        if (req.role !== "admin") {
            return res.status(403).json({ message: "Admin access required" });
        }
        next();
    });
};
