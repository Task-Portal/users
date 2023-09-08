// const { FormateData } = require("../utils");
// const { APIError } = require("../utils/app-errors");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { promisify } = require("util");
const randomBytes = promisify(crypto.randomBytes);
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const {
  JWT_SECRET,
  URL,
  URL_Postfix,
  API_KEY_TINIFY,
  REGION,
  BUCKET,
  ACCESS_KEY_ID,
  SECRET_ACCESS_KEY,
} = require("../config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const formidable = require("formidable");
const tinify = require("tinify");
tinify.key = API_KEY_TINIFY;

const FILE_SIZE = 5;
const CROP_WIDTH = 70;
const CROP_HEIGHT = 70;

const options = {
  filter: function ({ name, originalFilename, mimetype }) {
    // keep only images
    return mimetype && mimetype.includes("image");
  },
};

const schema = Joi.object({
  name: Joi.string().required().min(2).max(60),
  email: Joi.string()
    .required()
    .min(2)
    .max(100)
    .regex(
      /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/
    ),
  phone: Joi.string().required().pattern(new RegExp("^[+]{0,1}380([0-9]{9})$")),
  position_id: Joi.number().required().integer().min(1),
}).options({ abortEarly: false });

class UserService {
  constructor(unitOfWork) {
    this.unit = unitOfWork;
  }

  //#region Get all user methods
  async GetAll(countOnPage, offset, page) {
    const data = await this.unit.userRepo.GetAll(countOnPage, offset);
    const total_users = data.count;
    const total_pages = Math.ceil(total_users / countOnPage);
    const count = countOnPage;
    const links = {
      next_url: this.CreateNextUrl(total_pages, page, count),
      prev_url: this.CreatePreviousUrl(page, count),
    };

    const users = data.rows.map((u) => {
      if (u.position && u.position.name) {
        u.position = u.position.name;
      }
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        position: u.position,
        position_id: u.positionId,
        registration_timestamp: u.registration_timestamp,
        photo: u.photo,
      };
    });

    return {
      success: true,
      page,
      total_pages,
      total_users,
      count,
      links,
      users,
    };
  }

  CreateNextUrl(total_pages, page, count) {
    let nextPage = page + 1;
    if (nextPage > total_pages) return null;

    return `${URL}${URL_Postfix}/users?page=${nextPage}&count=${count}`;
  }

  CreatePreviousUrl(page, count) {
    let previousPage = page - 1;
    if (previousPage < 1) return null;

    return `${URL}${URL_Postfix}/users?page=${previousPage}&count=${count}`;
  }
  //#endregion
  //#region Token methods
  CreateJWTToken(name) {
    const maxAge = 60 * 40;
    const token = jwt.sign({ name }, JWT_SECRET, {
      expiresIn: maxAge,
    });
    return token;
  }

  IsTokenExpired(req) {
    let isTokenExpired = false;
    jwt.verify(req.get("jwt"), JWT_SECRET, function (err, decoded) {
      if (err) {
        isTokenExpired = true;
      }
    });
    return isTokenExpired;
  }
  //#endregion
  //#region Create user methods
  CheckUserRegistrationParams(fields) {
    const userData = Object.fromEntries(
      Object.entries(fields).map(([key, value]) => [key, value[0]])
    );

    const result = schema.validate(userData);
    if (result.error) {
      let fails = {};
      const details = result.error.details;
      for (let i in details) {
        fails[details[i].path[0]] = [details[i].message];
      }

      // return { success: false, message: "Validation failed", fails };
      return fails;
    }
    return null;
  }

  CheckImage(file) {
    let fails = { photo: [] };
    if (!file) {
      fails.photo.push("The image is invalid.");
    }
    for (let i in file) {
      const fileName = file[i].mimetype.toLowerCase();
      if (!fileName.endsWith("image/jpeg")) {
        fails.photo.push("The photo should be jpeg or jpg");
      }

      if (file[i].size / (1024 * 1024) > FILE_SIZE) {
        fails.photo.push("The photo may not be greater than 5 Mbytes.");
      }
    }
    return fails.photo.length > 0 ? fails : null;
  }

  async CroppingImage(image) {
    // Read the input image

    const source = tinify.fromFile(image);
    const resized = source.resize({
      method: "thumb",
      width: CROP_WIDTH,
      height: CROP_HEIGHT,
    });
    return await resized.toBuffer();
  }

  async CreateUser(req) {
    const form = new formidable.IncomingForm({
      keepExtensions: true,
      filter: function ({ name, originalFilename, mimetype }) {
        return mimetype && mimetype.includes("image");
      },
    });

    const [fields, files] = await form.parse(req);

    const resultFields = this.CheckUserRegistrationParams(fields);
    const resultImage = this.CheckImage(files.photo);
    const fails = { ...resultFields, ...resultImage };

    if (Object.keys(fails).length > 0) {
      return { success: false, message: "Validation failed", fails };
    }

    //check for email and phone
    const resultEmail = await this.CheckEmail(fields.email[0]);
    const resultPhone = await this.CheckPhone(fields.phone[0]);

    if (resultEmail || resultPhone) {
      return {
        success: false,
        message: "User with this phone or email already exists",
      };
    }

    // cropping image
    // optimized using the tinypng.com
    const resized = await this.CroppingImage(files.photo[0].filepath);

    //saving image to AMZ
    const imageUrl = await this.SaveImageToAws(resized);

    //save data to DB
    const user = {
      name: fields.name[0],
      email: fields.email[0],
      phone: fields.phone[0],
      photo: imageUrl,
      positionId: parseInt(fields.position_id[0]),
    };
    const result = await this.unit.userRepo.CreateUser(user);
    return {
      success: true,
      user_id: result.id,
      message: "New user successfully registered",
    };
  }

  async SaveImageToAws(resized) {
    const rawBytes = await randomBytes(16);
    const imageName = rawBytes.toString("hex").concat(".jpeg");

    const client = new S3Client({
      region: REGION,
      credentials: {
        secretAccessKey: SECRET_ACCESS_KEY,
        accessKeyId: ACCESS_KEY_ID,
      },
    });

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: `${imageName}`,
      Body: resized,
    });

    try {
      const response = await client.send(command);
      console.log(response);
    } catch (err) {
      console.error(err);
      throw err;
    }
    return `https://test-project-abz-photo-bucket.s3.amazonaws.com/${imageName}`;
  }

  async CheckEmail(email) {
    return this.unit.userRepo.IsEmailTaken(email);
  }

  async CheckPhone(phone) {
    return this.unit.userRepo.IsPhoneTaken(phone);
  }
  //#endregion

  async GetUserById(Id) {
    const user = await this.unit.userRepo.GetUserById(Id);
    if (user && user.dataValues) {
      return {
        success: true,
        user: {
          id: user.dataValues.id,
          name: user.dataValues.name,
          email: user.dataValues.email,
          phone: user.dataValues.phone,
          position: user.dataValues.position.name,
          position_id: user.dataValues.positionId,
          photo: user.dataValues.photo,
        },
      };
    }

    return {
      success: false,
      message: "The user with the requested identifier does not exist",
      fails: {
        user_id: ["User not found"],
      },
    };
  }
}

module.exports = UserService;
