const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;

const AuthorSchema = new Schema(
  {
    first_name: { type: String, required: true, max: 100 },
    family_name: { type: String, required: true, max: 100 },
    date_of_birth: { type: Date },
    date_of_death: { type: Date }
  }
);

// Virtual author's full name
AuthorSchema
  .virtual("name")
  .get(function () {
    return this.family_name + ", " + this.first_name;
  });

// Virtual author's lifespan
AuthorSchema
  .virtual("lifespan")
  .get(function () {
    return (this.date_of_death.getYear() - this.date_of_birth.getYear()).toString();
  });

// Virtual author's lifespan formatted
AuthorSchema
  .virtual("lifespan_formatted")
  .get(function () {
    const dob = this.date_of_birth ? moment(this.date_of_birth).format("MMMM Do, YYYY") : "";
    const dod = this.date_of_death ? moment(this.date_of_death).format("MMMM Do, YYYY") : "";

    if (!this.date_of_birth && !this.date_ofdeath) {
      return "This author only writes non-existential literature!";
    }
    return dob + " - " + dod;
  });

// Virtual author's DOB, formatted w/ moment.js
AuthorSchema
  .virtual("date_of_birth_formatted")
  .get(function () {
    return this.date_of_birth ? moment(this.date_of_birth).format("MMMM Do, YYYY") : "";
  });

// Virtual author's DOD, formatted w/ moment.js
AuthorSchema
  .virtual("date_of_death_formatted")
  .get(function () {
    return this.date_of_death ? moment(this.date_of_death).format("MMMM Do, YYYY") : "";
  });

// AuthorSchema
// .virtual("lifespan")
// .get(function () {
//   return (this.date_of_death.getYear() - this.date_of_birth.getYear()).toString();
// });

// Virtual author's URL
AuthorSchema.virtual("url").get(function () {
  return "/catalog/author/" + this._id;
});

// Export model
module.exports = mongoose.model("Author", AuthorSchema);
