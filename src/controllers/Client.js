/* eslint-disable comma-dangle */
/* eslint-disable operator-linebreak */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
const mongoose = require("mongoose");
const Client = require("../models/Client");
const ServiceProvider = require("../models/ServiceProvider");
const AppointmentType = require("../models/AppointmentType");

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



// get provider information by id
const getProviderInfo = async (req, res) => {
  // Extract providerId from query parameters
  const { _id: providerId } = req.query;

  try {
      const provider = await ServiceProvider.findById(providerId);

      if (provider) {
          // Return the provider object in the format expected by the frontend
          res.status(200).json({ provider: {
              name: provider.name,
              email: provider.email,
              phone: provider.phone,
              country: provider.country,
              city: provider.city,
              gender: provider.gender,
              typeOfService: provider.typeOfService,
              averageRating: provider.averageRating,
              bio: provider.bio,
              image: provider.image
          }});
      } else {
          res.status(404).json({ message: "Provider not found" });
      }
  } catch (error) {
      res.status(500).json({ error });
  }
};


// // Search Service Providers By Parameters
const searchProviders = async (req, res) => {
  // Destructure query parameters from the request
  const { typeOfService, city, minPrice, maxPrice, averageRating } = req.query;

  // Build the MongoDB query object based on the provided query parameters
  const query = {
    ...(typeOfService && { typeOfService }),
    ...(city && { city }),
    ...(averageRating && { averageRating: { $gte: averageRating } }),
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
    return res.status(200).json({ providers: providersWithPriceRange });
  } catch (error) {
    // Log the error and send a 500 Internal Server Error response
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
};


// getProviderScheduleInfo returns the schedule information of a service provider
const getProviderScheduleInfo = async (req, res) => {
  try {
    // Extract providerID from request parameters
    const { providerID } = req.params;

    // Query the database to find the service provider by their ID
    // Select only specific fields and populate related documents
    const provider = await ServiceProvider.findById(providerID)
      .select('blockedDates blockedTimeSlots appointments appointmentTypes')
      // Populate blockedTimeSlots related to the service provider
      .populate('blockedTimeSlots')
      // Populate appointments related to the service provider
      // Filter only "Upcoming" appointments and select only "date" and "duration" fields
      .populate({
        path: 'appointments',
        match: { status: 'Upcoming' }, // Filter to include only "Upcoming" appointments
        select: 'date duration' // Select only the "date" and "duration" fields
      })
      // Populate appointmentTypes related to the service provider
      .populate('appointmentTypes');

    // If the provider is not found, return a 404 status with a message
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // Destructure the relevant fields from the provider document
    const { blockedDates, blockedTimeSlots, appointments, appointmentTypes,} = provider;
    console.log(provider);

    // Send the response as a JSON object
    res.status(200).json({blockedDates,blockedTimeSlots, appointments, appointmentTypes,});

  } catch (error) { // Catch any errors
    console.error(error); // Log the error to the console
    res.status(500).json({ message: 'Server Error' }); // Send a 500 status with a message
  }
};




module.exports = {
  // createClient,
  // readClient,
  // readAllClients,
  // updateClient,
  // deleteClient,
  searchProviders,
  getProviderInfo,
  getProviderScheduleInfo,
};
