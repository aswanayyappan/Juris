const { generateSyntheticRegTechData } = require('./src/services/dataGenerator');

try {
  const result = generateSyntheticRegTechData({
    name: "Test Business",
    state: "Maharashtra",
    type: "Pvt Ltd",
    cin: ""
  });
  console.log("Success! Data generated. Root keys:", Object.keys(result));
} catch (e) {
  console.error("Data Gen Error Stack:", e.stack);
  console.error("Data Gen Error Message:", e.message);
}
