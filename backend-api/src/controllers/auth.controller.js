const { getService } = require('../services/db.factory');
const { signToken } = require('../middleware/auth');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

    const authService = getService('auth');
    const user = await authService.findUserByEmail(email);
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const valid = await authService.verifyPassword(password, user.password);
    if (!valid) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const { password: _, ...safe } = user;
    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.json({ success: true, data: { user: safe, token } });
  } catch (err) { next(err); }
};

exports.getProfile = async (req, res, next) => {
  try {
    const authService = getService('auth');
    const user = await authService.findUserById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    const { password: _, ...safe } = user;
    res.json({ success: true, data: safe });
  } catch (err) { next(err); }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await getService('auth').getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
};

exports.createUser = async (req, res, next) => {
  try {
    const user = await getService('auth').createUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) { next(err); }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await getService('auth').updateUser(req.params.id, req.body);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await getService('auth').deleteUser(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
};
