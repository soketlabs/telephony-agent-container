import jwt from "jsonwebtoken";

export function auth(req, res, next) {
    const header = req.headers.authorization;
    if (!header){
        return res.status(401).json({ error: "No token" });
    }
    const token = header.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ error: "Invalid token" });
    }
}
