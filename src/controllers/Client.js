const Client = require("../models/Client");
const ServiceProvider = require("../models/ServiceProvider");
const jwt = require("jsonwebtoken");
// const { default: Appointments } = require("../../../FurryFriendsServices_Frontend/src/components/client_components/Appointments");
// GET CONTROLLERS
// const readClient = async (req, res) => {
//   const clientId = req.params.clientId;

//   try {
//     const client = await Client.findById(clientId);
//     return client
//       ? res.status(200).json({ client })
//       : res.status(404).json({ message: "Client not found" });
//   } catch (error) {
//     return res.status(500).json({ error });
//   }
// };
// const readAllClients = async (_, res) => {
//   try {
//     const clients = await Client.find({});
//     return res.status(200).json({ clients });
//   } catch (error) {
//     return res.status(500).json({ error });
//   }
// };

// // POST CONTROLLERS
// const createClient = async (req, res) => {
//   const { data } = req.body;
//   const client = new Client({
//     _id: new mongoose.Types.ObjectId(),
//     data,
//   });

//   try {
//     await client.save();
//     return res.status(201).json({ client });
//   } catch (error) {
//     return res.status(500).json({ error });
//   }
// };

// // PATCH CONTROLLERS
// const updateClient = async (req, res) => {
//   const clientId = req.params.clientId;
//   try {
//     // finding the client by id
//     const client = await Client.findById(clientId);
//     if (client) {
//       try {
//         client.set(req.body);
//         await client.save();
//         return res.status(201).json({ client });
//       } catch (error) {
//         res.status(500).json({ error });
//       }
//     } else {
//       res.status(404).json({ message: "Client not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ error });
//   }
// };

// DELETE CONTROLLERS
// const deleteClient = async (req, res) => {
//   const clientId = req.params.clientId;

//   try {
//     await Client.findByIdAndDelete(clientId);
//     return res.status(201).json({
//       message: clientId + "Deleted from database!",
//     });
//   } catch (error) {
//     return res.status(500).json({ message: "Client not found" });
//   }
// };

/**
 * Creates a web token for the client that expires after 1 day.
 * @param {*} _id
 * @return {Promise} jwt token
 */
const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, {expiresIn: "1d"});
};


// get provider information by id
const getProviderInfo = async (req, res) => {
    // Extract providerId from query parameters
    const {_id: providerId} = req.query;

    try {
        const provider = await ServiceProvider.findById(providerId);

        if (provider) {
            // Return the provider object in the format expected by the frontend
            res.status(200).json({provider: {
                name: provider.name,
                email: provider.email,
                phone: provider.phone,
                country: provider.country,
                city: provider.city,
                gender: provider.gender,
                typeOfService: provider.typeOfService,
                averageRating: provider.averageRating,
                bio: provider.bio,
                image: provider.image,
            }});
        } else {
            res.status(404).json({message: "Provider not found"});
        }
    } catch (error) {
        res.status(500).json({error});
    }
};


// // Search Service Providers By Parameters
const searchProviders = async (req, res) => {
    // Destructure query parameters from the request
    const {typeOfService, city, minPrice, maxPrice, averageRating} = req.query;

    // Build the MongoDB query object based on the provided query parameters
    const query = {
        ...(typeOfService && {typeOfService}),
        ...(city && {city}),
        ...(averageRating && {averageRating: {$gte: averageRating}}),
    };

    try {
    // Fetch providers from the database that match the query
        let providers = await ServiceProvider.find(query)
            .select("name image _id averageRating appointmentTypes typeOfService city")
            .populate("appointmentTypes");

        // Filter providers based on minPrice and maxPrice if provided
        if (minPrice || maxPrice) {
            providers = providers.filter((provider) => {
                const appointmentTypes = provider.appointmentTypes;
                if (!appointmentTypes || appointmentTypes.length === 0) return false;

                let validForMinPrice = !minPrice;
                let validForMaxPrice = !maxPrice;

                // Check if the provider's appointment types meet the price criteria
                for (const type of appointmentTypes) {
                    if (minPrice && type.price >= minPrice) validForMinPrice = true;
                    if (maxPrice && type.price <= maxPrice) validForMaxPrice = true;
                }

                return validForMinPrice && validForMaxPrice;
            });
        }

        // Map providers to include min and max price ranges
        const providersWithPriceRange = providers.map((provider) => {
            const appointmentTypes = provider.appointmentTypes;
            let minPrice = 0;
            let maxPrice = 0;

            // Calculate min and max price for each provider based on their appointment types
            if (appointmentTypes && appointmentTypes.length > 0) {
                minPrice = Math.min(...appointmentTypes.map((type) => type.price));
                maxPrice = Math.max(...appointmentTypes.map((type) => type.price));
            }

            return {
                _id: provider._id,
                name: provider.name,
                image: provider.image,
                averageRating: provider.averageRating,
                typeOfService: provider.typeOfService,
                city: provider.city,
                minPrice: minPrice,
                maxPrice: maxPrice,
            };
        });

        // Send the filtered and mapped providers as a JSON response
        return res.status(200).json({providers: providersWithPriceRange});
    } catch (error) {
    // Log the error and send a 500 Internal Server Error response
        console.error("Error:", error);
        return res.status(500).json({error: error.message});
    }
};

/**
 * uses static method of Client model to create a new client
 * if successful returns response code 200, else returns response code 400.
 * @param {*} req client signup form
 * @param {*} res
 */
const createClient = async (req, res) => {
    try {
        const client = await Client.createClient(req.body);
        // create a token for the client
        const token = createToken(client._id);
        return res.status(200).json({id: client._id, token: token});
    } catch (e) {
        console.log(e, " This is the error");
        return res.status(400).json({error: e.message});
    }
};

/**
 * uses the login static function of the model, if it returns a client instance a token is created and it returns a response code 200 with
 * name, token, email and client id. else it returns status code 400 with the corresponding error message.
 * @param {*} req
 * @param {*} res
 */
const clientLogin = async (req, res) => {
    const {email, password} = req.body;
    console.log(email, password);
    try {
        console.log(req.body);
        const client = await Client.login(email, password);

        // create token
        const token = createToken(client._id);
        return res.status(200).json({name: client.name, token: token, email: client.email, id: client._id});
    } catch (e) {
        return res.status(400).json({error: e.message});
    }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @return {JSON} object containing the response, either a JSON containing id, name and phone or an error
 */
const updateClient = async (req, res) => {
    const {id, name, phone} = req.body;
    console.log(req.body);
    console.log(name, phone);
    try {
        if (phone) {
            await Client.changePhone(id, phone);
        } else if (name) {
            await Client.changeName(id, name);
        }
        return res.status(200).json({id: id, name: name, phone: phone});
    } catch (e) {
        return res.status(400).json({error: e.message});
    }
};


/**
 *
 * @param {*} req
 * @param {*} res
 * @return {JSON} getProviderScheduleInfo returns the schedule information of a service provider
 */
const getProviderScheduleInfo = async (req, res) => {
    try {
    // Extract providerID from request parameters
        const {providerID} = req.params;

        // Query the database to find the service provider by their ID
        // Select only specific fields and populate related documents
        const provider = await ServiceProvider.findById(providerID)
            .select("blockedDates blockedTimeSlots appointments appointmentTypes")
        // Populate blockedTimeSlots related to the service provider
            .populate("blockedTimeSlots")
        // Populate appointments related to the service provider
        // Filter only "Upcoming" appointments and select only "date" and "duration" fields
            .populate({
                path: "appointments",
                match: {status: "Upcoming"}, // Filter to include only "Upcoming" appointments
                select: "date duration", // Select only the "date" and "duration" fields
            })
        // Populate appointmentTypes related to the service provider
            .populate("appointmentTypes");

        // If the provider is not found, return a 404 status with a message
        if (!provider) {
            return res.status(404).json({message: "Provider not found"});
        }

        // Destructure the relevant fields from the provider document
        const {blockedDates, blockedTimeSlots, appointments, appointmentTypes} = provider;
        console.log(provider);

        // Send the response as a JSON object
        res.status(200).json({blockedDates, blockedTimeSlots, appointments, appointmentTypes});
    } catch (error) { // Catch any errors
        console.error(error); // Log the error to the console
        res.status(500).json({message: "Server Error"}); // Send a 500 status with a message
    }
};

/**
 * queries a client with the required clientId, if found returns status code 200 with the client as json, else returns
 * status code 404 with "Client not found" error message. any other error will lead to status code 500 with the error that
 * occoured.
 * @param {} req
 * @param {*} res
 * @return {JSON} client or error
 */

const readClient = async (req, res) => {
    const clientId = req.params.clientId;
    try {
        const client = await Client.findOne({_id: clientId});
        console.log(client);
        return client? res.status(200).json({client: client}):res.status(404).json({err: "Client not found"});
    } catch (e) {
        return res.status(500).json({message: e.message}); // response code 500 containing the error message.
    }
};
/**
 * searches for a specific client in client database using clientId, and then populates the client's appointments field
 * with clientId, serviceProviderId, appointmentType and date. then it populates name from service provider, name from client,
 * name price and duration of appointment from appointmentType and returns a json object with appointments property containing objects of
 * these appointment fields.
 * @param {*} req
 * @param {*} res
 * @return {JSON} JSON object with appointments field that contains objects with fields of clientId, serviceProviderId, appointmentType and date.
 */
const getClientAppointments = async (req, res) => {
    const clientId = req.params.clientId;
    try {
        const client = await Client.findOne({_id: clientId});
        const {appointments} = await client.populate("appointments", "clientId serviceProviderId appointmentType date status duration");
        for (const i in appointments) {
            if (appointments.hasOwnProperty(i)) {
                await appointments[i].populate("serviceProviderId", "name");
                await appointments[i].populate("clientId", "name");
                await appointments[i].populate("appointmentType", "name price duration");
            }
        }
        return client? res.status(200).json({appointments: appointments}):res.status(404).json({err: "Client not found"});
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
};

module.exports = {
    clientLogin,
    createClient,
    readClient,
    // readAllClients,
    updateClient,
    // deleteClient,
    searchProviders,
    getProviderInfo,
    getProviderScheduleInfo,
    getClientAppointments,
};
