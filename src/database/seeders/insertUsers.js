const { fakerEN_GB: faker } = require("@faker-js/faker");
const UserModel = require("../models/User");

const generateUsers = () => {
  let arr = [];
  while (arr.length < 45) {
    const name = faker.person.firstName();
    const email = faker.internet.email();
    const phone = `+380 ${faker.phone.number().slice(2).replace(/\s/g, "")}`;
    const photo = faker.image.avatar();
    const positionId = Math.floor(Math.random() * 44)+1;
    if (!arr.includes(name)) {
      arr.push({ name, email, phone, photo, positionId  });
    }
  }
  return arr;
};

const insertUsers = async () => {
  const users = generateUsers();
  await UserModel.bulkCreate(users);
};

// const getUserJpegPhoto = ()=>{

//   let photo=""
//   do {
//     photo= faker.image.avatar()
//   } while (!photo.endsWith("jpg")|| !photo.endsWith("jpeg"));
//   return photo
 
// }


// const getUserJpegPhoto=()=>{
//   let photo = faker.image.avatar()
//   if(!photo.endsWith("jpg") || !photo.endsWith("jpeg")){
//       photo= photo.concat(".jpeg")  
//   }
//   console.log(photo)
  
// return photo
// }


insertUsers()
  .then(() => {
    console.log("Users inserted successfully.");
  })
  .catch((error) => {
    console.error("Error inserting users:", error);
  });
