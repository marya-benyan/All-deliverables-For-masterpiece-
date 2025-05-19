const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { User } = require("../models");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "البريد الإلكتروني غير صالح" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، بما في ذلك حرف كبير، حرف صغير، رقم، وحرف خاص",
      });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: "المستخدم موجود بالفعل" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newRole = role || "user";
    if (role && role !== "user" && role !== "admin") {
      return res.status(400).json({ error: "الدور غير صالح، يجب أن يكون user أو admin" });
    }

    console.log("Role before saving user:", newRole);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: newRole,
    });

    await user.save();

    console.log("User saved with role:", user.role);

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });

    res.status(201).json({
      message: "تم التسجيل بنجاح",
      user: { id: user._id, name, email, role: user.role },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "خطأ في التسجيل" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    console.log("req.body:", req.body);
    const { email, password } = req.body;

    if (!email || typeof email !== "string") {
      console.log("Invalid email format:", email);
      return res.status(400).json({ error: "البريد الإلكتروني غير صالح" });
    }
    if (!password || typeof password !== "string") {
      console.log("Invalid password format:", password);
      return res.status(400).json({ error: "كلمة المرور غير صالحة" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "المستخدم غير موجود" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "كلمة المرور غير صحيحة" });

    user.lastLogin = Date.now();
    await user.save();

    console.log("User role before generating token:", user.role);

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });

    console.log("Token generated with role:", user.role);

    res.json({
      message: "تم تسجيل الدخول بنجاح",
      user: { id: user._id, name: user.name, email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "خطأ في تسجيل الدخول" });
  }
};

exports.logout = (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });
    console.log("User logged out successfully");
    res.status(200).json({ message: "تم تسجيل الخروج بنجاح" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "خطأ في تسجيل الخروج" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });
    res.json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ error: "خطأ في جلب بيانات المستخدم" });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });
    res.json(user);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "خطأ في جلب بيانات المستخدم الحالي" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, address, bio, photo } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "البريد الإلكتروني غير صالح" });
      }
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ error: "البريد الإلكتروني مستخدم بالفعل" });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (bio) user.bio = bio;
    if (photo) user.photo = photo;

    await user.save();
    res.json({ message: "تم تحديث الملف الشخصي بنجاح", user: user.toObject({ getters: true }) });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "خطأ في تحديث بيانات المستخدم" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "كلمة المرور الحالية غير صحيحة" });

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        error:
          "كلمة المرور الجديدة يجب أن تحتوي على 8 أحرف على الأقل، بما في ذلك حرف كبير، حرف صغير، رقم، وحرف خاص",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "خطأ في تغيير كلمة المرور" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "المستخدم غير موجود" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "إعادة تعيين كلمة المرور",
      text: `لقد تلقيت هذا البريد لأنك (أو شخص آخر) طلبت إعادة تعيين كلمة المرور لحسابك.\n\n
      الرجاء النقر على الرابط التالي، أو نسخه ولصقه في متصفحك لإكمال العملية:\n\n
      ${resetUrl}\n\n
      إذا لم تطلب هذا، يرجى تجاهل هذا البريد الإلكتروني.\n`,
    };

    console.log("Sending email to:", user.email);
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", user.email);

    res.json({ message: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "خطأ في إرسال رابط إعادة تعيين كلمة المرور" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ error: "رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية" });

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "كلمة المرور الجديدة يجب أن تحتوي على 8 أحرف على الأقل، بما في ذلك حرف كبير، حرف صغير، رقم، وحرف خاص",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "تم إعادة تعيين كلمة المرور بنجاح" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "خطأ في إعادة تعيين كلمة المرور" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "خطأ في جلب قائمة المستخدمين" });
  }
};