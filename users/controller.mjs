import { ServerError } from "../error.mjs";
import bcrypt from "bcrypt";
import { prisma, Prisma, DB_ERR_CODES } from "../prisma/db.mjs";
import { errorPritify, UserSignupModel, UserLoginModel } from "./validator.mjs";
import emailQueue from "../queue/email.queue.mjs";
import { asyncJwtSign } from "../asyncJwt.mjs";
import { generateSecureRandomString } from "../utils.mjs";
import dayjs from "dayjs";
import { uploadImage } from "../storage/storage.mjs";
import { OAuth2Client } from "google-auth-library";

const signup = async (req, res, next) => {
  // validate input data
  const result = await UserSignupModel.safeParseAsync(req.body);
  if (!result.success) {
    throw new ServerError(400, errorPritify(result));
  }

  // hash password
  const hasedPassword = await bcrypt.hash(req.body.password, 10);

  // 2. generate a 32 keyword random string
  const randomStr = generateSecureRandomString(32);

  // 3. update this string in DB with future 15min expiry time
  const futureExpiryTime = dayjs().add(15, "minute");

  // add user to DB
  try {
    const newUser = await prisma.user.create({
      data: {
        email: req.body.email,
        name: req.body.name,
        password: hasedPassword,
        resetToken: randomStr,
        tokenExpiry: futureExpiryTime,
      },
    });

    // 4. make link example https://localhost:5000/resetPassword/fgvjkdsuhvgyahfvajdsfahvdsjvbd
    const link = `${req.protocol}://${process.env.FRONTEND_URL}/${randomStr}`;

    await emailQueue.add("welcome_email", {
      to: newUser.email,
      subject: "Verfication Email",
      body: `<html>
      <h1>Welcome ${newUser.name}</h1>
      <a href=${link}>Click Here to verify account</a>
    </html>`,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === DB_ERR_CODES.UNIQUE_ERR) {
        throw new ServerError(401, "User with this email already exists.");
      }
    }
    throw err;
  }

  // IN FUTURE Implement something like this
  // const user = await catchDBError(await prisma.user.create({
  //   data: {
  //     email: req.body.email,
  //     name: req.body.name,
  //     password: hasedPassword,
  //     resetToken: randomStr,
  //     tokenExpiry: futureExpiryTime
  //   },
  // }))

  res.json({ msg: "signup is successful" });
};

// Login processs
const login = async (req, res, next) => {
  const result = await UserLoginModel.safeParseAsync(req.body);
  if (!result.success) {
    throw new ServerError(400, errorPritify(result));
  }

  const user = await prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
  });

  if (!user) {
    throw new ServerError(404, "user is not found");
  }

  if (!user.accountVerified) {
    throw new ServerError(404, "verify you account first");
  }

  if (!(await bcrypt.compare(req.body.password, user.password))) {
    throw new ServerError(401, "password mismatch");
  }

  const token = await asyncJwtSign(
    { id: user.id, name: user.name, email: user.email, role: user.Role },
    process.env.TOKEN_SECRET,
    { expiresIn: process.env.TOKEN_EXPIRY_TIME }
  );

  res.json({
    msg: "login successful",
    token,
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.Role,
    profilePhoto: user.profilePhoto,
  });
};

// google client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

// google Login
const googleLogin = async (req, res, next) => {
  console.log(req.body);
  try {
    const response = await googleClient.getToken(req.body.code);
    // console.log(response);

    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${response.tokens.access_token}` },
      }
    );
    if (!userResponse.ok) {
      throw new Error(`Userinfo request failed: ${userResponse.statusText}`);
    }
    const userData = await userResponse.json();
    console.log(userData);
  } catch (error) {
    console.log(error);
  }

  res.json({
    msg: "Google login successful",
  });
};

const googleUser = await prisma.user.upsert({
  where: { email: user.email },
  update: {},
  create: {
    email: user.email,
    name: user.name,
    image: user.picture,
    accountVerified: true,
  },
});

console.log(googleUser);

// forgotPassword
const forgotPassword = async (req, res, next) => {
  // 2. generate a 32 keyword random string
  const randomStr = generateSecureRandomString(32);

  // 3. update this string in DB with future 15min expiry time
  const futureExpiryTime = dayjs().add(15, "minute");

  const userArr = await prisma.user.updateManyAndReturn({
    where: {
      email: req.body.email,
    },
    data: {
      resetToken: randomStr,
      tokenExpiry: futureExpiryTime,
    },
  });

  if (userArr.length === 0) {
    throw new ServerError(404, "User not found, please signup first");
  }

  const user = userArr[0];

  // 4. make link example https://localhost:5000/resetPassword/fgvjkdsuhvgyahfvajdsfahvdsjvbd
  const link = `${req.protocol}://${process.env.FRONTEND_URL}/${randomStr}`;

  await emailQueue.add("forgot_pass", {
    to: user.email,
    subject: "Forgot Password",
    body: `<html>
      <h1>Hi, ${user.name}</h1>
      <a href=${link}>Click Here to reset password</a>
    </html>`,
  });
  res.json({ msg: "Email sent" });
};

const resetPassword = async (req, res, next) => {
  // 1. Extract token from req.body
  if (!req.body || !req.body.token) {
    throw new ServerError(401, "Invalid link or token");
  }
  // 2. find User via token from DB
  const user = await prisma.user.findFirst({
    where: {
      resetToken: req.body.token,
    },
  });
  if (!user) {
    throw new ServerError(401, "Invalid link or token");
  }
  // 3. check for token expiry
  if (dayjs(user.tokenExpiry).isBefore(dayjs())) {
    throw new ServerError(401, "Link expired");
  }
  if (user.accountVerified && !req.body.password) {
    if (req.body.password.length < 6) {
      throw new ServerError(401, "password should not be less than 6");
    }
    throw new ServerError(401, "password must be supplied");
  }

  if (user.accountVerified) {
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    await prisma.user.updateMany({
      where: { id: user.id },
      data: {
        password: hashedPass,
        resetToken: null,
        tokenExpiry: null,
      },
    });
    res.json({ msg: "reset password successful" });
  } else {
    await prisma.user.updateMany({
      where: { id: user.id },
      data: {
        accountVerified: true,
        resetToken: null,
        tokenExpiry: null,
      },
    });
    res.json({ msg: "Account verification successful" });
  }
};

const getMe = async (req, res, next) => {
  // 1. Extract user from request
  // 2. find user in DB by ID or Email
  // 3. Send user details without password
  res.json({ msg: "This is me", me: req.user });
};

const updateProfileImage = async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
  });
  let result;
  if (!user.profilePhoto) {
    // Delete image from cloudnary
    const fileName = `${generateSecureRandomString(32)}`;
    // upload to cloud storage
    result = await uploadImage(req.file.buffer, fileName, "profiles", true);
    // update file url in DB
  } else {
    // split by "/"
    const splittedUrl = user.profilePhoto.split("/");
    // pick last part of URL which is file name with extenstion
    const fileNameWithExt = splittedUrl[splittedUrl.length - 1];
    const fileName = fileNameWithExt.split(".")[0];
    result = await uploadImage(req.file.buffer, fileName, "profiles", true);
  }

  await prisma.user.update({
    where: { id: req.user.id },
    data: {
      profilePhoto: result.secure_url,
    },
  });

  res.json({ msg: "image uploaded successfully" });
};

export {
  signup,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfileImage,
};
