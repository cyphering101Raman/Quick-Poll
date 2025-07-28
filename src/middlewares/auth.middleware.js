import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next)=>{
  const token = req.cookies.token;

  if(!token) return res.status(401).json({ message: "Not authenticated" })

    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
      req.user = decodedToken
      next()
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
}

