const { fakerEN_GB: faker } = require("@faker-js/faker");
const PositionModel = require("../models/Position");

const possibleProfessions = [
  "Doctor",
  "Engineer",
  "Teacher",
  "Artist",
  "Software Developer",
  "Nurse",
  "Lawyer",
  "Accountant",
  "Architect",
  "Chef",
  "Dentist",
  "Pharmacist",
  "Electrician",
  "Plumber",
  "Pilot",
  "Police Officer",
  "Firefighter",
  "Paramedic",
  "Mechanic",
  "Graphic Designer",
  "Journalist",
  "Actor",
  "Musician",
  "Scientist",
  "Librarian",
  "Psychologist",
  "Veterinarian",
  "Banker",
  "Salesperson",
  "Consultant",
  "Photographer",
  "Author",
  "Interior Designer",
  "Event Planner",
  "Web Developer",
  "Marketing Manager",
  "Real Estate Agent",
  "Social Worker",
  "Chef",
  "Biologist",
  "Fitness Trainer",
  "Geologist",
  "Hairdresser",
  "Translator",
];


const generatePositions = () => {
  // let arr = [];
  // while (arr.length < 25) {
  //   const position = faker.person.jobType();
  //   if (!arr.includes(position)) {
  //     arr.push({ name: position });
  //   }
  // }
  // return arr;
  return possibleProfessions.map(p=>({name: p}))
};

const insertPositions = async () => {
  const positions = generatePositions();
  await PositionModel.bulkCreate(positions);
};

insertPositions()
  .then(() => {
    console.log("Positions inserted successfully.");
  })
  .catch((error) => {
    console.error("Error inserting positions:", error);
  });
