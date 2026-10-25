
import User from '../models/User.js';

export async function optionalAuth(req, res, next) {
  try {
    const userId = req.session?.userId;

    if (!userId) {
      return next();
    }

    const user = await User.findById(userId);

    if (user?.isActive) {
      req.user = user;
    }

    return next();
  } catch (error) {
    return next(error);
  }
}
