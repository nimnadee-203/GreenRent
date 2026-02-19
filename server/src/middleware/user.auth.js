import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.json({ success: false, message: 'Not Authorized.Log Again' })
    }

    try {
        //Decode the token
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        if (tokenDecode.id) {
            req.body.userId = tokenDecode.id
        } else {
            return res.json({ success: false, message: "Not Authorized.Log Again" })
        }

        next();

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export default userAuth;