
import User from '../models/User.js';

export async function requireAuth(req, res, next) {
  try {
    const userId = req.session?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const user = await User.findById(userId);

    if (!user || !user.isActive) {
      return req.session.destroy((error) => {
        if (error) {
          return next(error);
        }

        const cookieName =
          process.env.NODE_ENV === 'production'
            ? '__Host-session'
            : 'sessionId';

        res.clearCookie(cookieName, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });

        return res.status(401).json({
          success: false,
          message: 'Authentication required.',
        });
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}
