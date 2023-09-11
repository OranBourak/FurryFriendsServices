/* eslint-disable key-spacing */
/* eslint-disable comma-spacing */
/* eslint-disable object-curly-spacing */
/* eslint-disable no-tabs */
/* eslint-disable indent */
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const ClientSchema = new Schema(
	{
		name: { type: String, required: [true, "No user name given!"] },
		email: { type: String, unique: true, required: [true, "No email given!"] },
		password: { type: String, required: [true, "No password given!"] },
		country: { type: String, default: "Israel" },
		phone: {
			type: String,
			maxLength: 10,
			minLength: 10,
			required: [true, "No phone given!"],
		},
		secretQuestion: {
			type: String,
			required: [true, "No security question provided!"],
		},
		answer: { type: String, required: [true, "No security answer provided!"] },
		appointments: [{ type: Schema.Types.ObjectId, ref: "Appointment" }],
	},
	{ versionKey: false, timestamps: true },
);

/**
 * receives data, hashes password field and returns a user if a user doesn't exist, else returns error.
 * returns user if email is not already in use, otherwise returns an error indicating that a user under this email exists
 * @param {string} email - The client's email.
 * @param {string} password - The client's password.
 * @return {Object} The authenticated client's data.
 * @throws {Error} Throws an error if authentication fails.
 */
ClientSchema.statics.createClient = async function({name, email, password, secretQuestion, answer, phone, appointments, country="Israel"}) {
	// if exists returns error
	const exists = await this.findOne({email});
	console.log(name, email, password, secretQuestion, answer, phone, appointments);
	if (exists) {
		throw Error("Email is already in use");
	}
	// validate fields for unit testing maybe ?

	console.log(email,password, secretQuestion, answer);
	// salting the password and hashing process
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);
	console.log(email,password);

	const client = await this.create({name, email, password:hashedPassword, phone, secretQuestion, answer, appointments});

	return client;
};


ClientSchema.statics.login = async function login(email, password) {
	if (!email || !password) {
		throw Error("All fields must be filled");
	}

	// returns client data if there is one
	const client = await this.findOne({email});
	if (!client) {
		throw Error("Incorrect email");
	}

	const match = await bcrypt.compare(password, client.password);
	console.log(password, client.password, match);

	// miss
	if (!match) {
		throw Error("Incorrect password");
	}

	return client;
};

ClientSchema.statics.changeName = async function changeName(id,name) {
	if (/^[A-Za-z]+([ ][A-Za-z]+)*$/.test(name)) {
		await this.updateOne({_id: id},{name: name});
		return "Name has been updated successfully.";
	}
	return false;
};

ClientSchema.statics.changePhone = async function changePhone(id,phone) {
	await this.updateOne({_id: id},{phone: phone});
	console.log(phone);
	return "Phone has been updated successfully.";
};


module.exports = mongoose.model("Client", ClientSchema);
